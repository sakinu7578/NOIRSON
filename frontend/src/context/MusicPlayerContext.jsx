import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mixes from '../data/mixData.js';
import { assetUrl } from '../utils/assetUrl.js';
import MusicPlayerContext from './musicPlayerContext.js';
import { releaseAudioSpectrum, syncAudioSpectrumMute } from '../pages/useAudioSpectrum.js';
import { PlayHistoryApiError, recordPlayHistory } from '../api/playHistory.js';
import useAuth from '../hooks/useAuth.js';

// 目前播放清單來自本地 Mix 資料，與後端 API 尚未串接。
const playlist = Object.entries(mixes).map(([id, mix]) => ({ id, ...mix }));
const mixIds = playlist.map(({ id }) => id);

export function MusicPlayerProvider({ children }) {
  const { currentUser, isAuthLoading, authError, captureAuthSession, clearInvalidatedSession } = useAuth();
  const audioRef = useRef(null);
  const listenersRef = useRef(null);
  const playMixRef = useRef(null);
  const autoNextListenersRef = useRef(new Set());
  const mixIdRef = useRef('M001');
  const modesRef = useRef({ isLooping: false, autoNext: false });
  const playRequestRef = useRef(0);
  const sourceTokenRef = useRef(0);
  const handledSourceRef = useRef(null);
  const recordedMixRef = useRef(null);
  const authRef = useRef({ userId: null, generation: 0 });
  const historyQueueRef = useRef(Promise.resolve());
  const lastAudibleRef = useRef(1);
  const volumeRef = useRef(1);
  const mutedRef = useRef(false);
  const [currentMixId, setCurrentMixId] = useState('M001');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  const [error, setError] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    const userId = !isAuthLoading && !authError ? currentUser?.id ?? null : null;
    if (authRef.current.userId !== userId) {
      authRef.current = { userId, generation: authRef.current.generation + 1 };
      recordedMixRef.current = null;
    }
  }, [currentUser, isAuthLoading, authError]);

  // 序號讓較早的非同步播放結果不會覆蓋後來的操作狀態。
  const playAudio = useCallback(async (audio) => {
    const request = ++playRequestRef.current;
    try {
      await audio.play();
      return request === playRequestRef.current;
    } catch (playError) {
      if (request === playRequestRef.current) {
        setIsPlaying(false);
        setError(playError);
      }
      return false;
    }
  }, []);

  // 延遲建立單一 Audio，所有頁面透過 Context 操作同一個實例。
  const playMix = useCallback((id) => {
    if (!Object.hasOwn(mixes, id)) return Promise.resolve(false);
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.preload = 'metadata';
      audio.volume = volumeRef.current;
      audio.muted = mutedRef.current;
      audioRef.current = audio;

      const onPlay = () => {
        setIsPlaying(true);
        setHasPlayed(true);
      };
      const onPlaying = () => {
        // 舊來源的排隊事件、恢復播放與原生 Loop 都不建立新紀錄。
        if (audio.paused || !audio.currentSrc || audio.currentSrc !== audio.src
          || audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        const token = sourceTokenRef.current;
        if (handledSourceRef.current === token || recordedMixRef.current === mixIdRef.current) return;
        handledSourceRef.current = token;
        const code = mixIdRef.current;
        const { userId, generation } = authRef.current;
        if (userId === null) return;
        recordedMixRef.current = code;
        // 同一播放區段先標記再排隊；待送事件若已換會員便丟棄。
        historyQueueRef.current = historyQueueRef.current.then(async () => {
          if (authRef.current.userId !== userId || authRef.current.generation !== generation) return;
          const session = captureAuthSession();
          try {
            await recordPlayHistory(code);
            if (authRef.current.userId === userId && authRef.current.generation === generation) {
              setHistoryVersion((version) => version + 1);
            }
          } catch (error) {
            if (error instanceof PlayHistoryApiError && error.status === 401) clearInvalidatedSession(session);
            // 紀錄失敗不重試，也不阻斷音樂或下一筆播放事件。
          }
        });
      };
      const onPause = () => setIsPlaying(false);
      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      const onDurationChange = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      const onVolumeChange = () => {
        volumeRef.current = audio.volume;
        mutedRef.current = audio.muted;
        setVolumeState(audio.volume);
        setIsMuted(audio.muted);
        syncAudioSpectrumMute(audio);
      };
      const onError = () => {
        ++playRequestRef.current;
        setIsPlaying(false);
        setError(audio.error ?? new Error('Audio playback failed'));
      };
      // 曲終時以最新模式判斷下一首；單曲循環交由 Audio.loop 處理。
      const onEnded = () => {
        if (!audio.ended) return;
        setIsPlaying(false);
        if (modesRef.current.autoNext && !modesRef.current.isLooping) {
          const index = mixIds.indexOf(mixIdRef.current);
          const nextId = mixIds[(index + 1) % mixIds.length];
          playMixRef.current?.(nextId);
          autoNextListenersRef.current.forEach((listener) => listener(nextId));
        }
      };
      const listeners = { play: onPlay, playing: onPlaying, pause: onPause, timeupdate: onTimeUpdate,
        loadedmetadata: onLoadedMetadata, durationchange: onDurationChange,
        volumechange: onVolumeChange, error: onError, ended: onEnded };
      Object.entries(listeners).forEach(([event, handler]) => audio.addEventListener(event, handler));
      listenersRef.current = listeners;
    }

    if (mixIdRef.current !== id || !audio.src) {
      ++playRequestRef.current;
      audio.pause();
      mixIdRef.current = id;
      ++sourceTokenRef.current;
      recordedMixRef.current = null;
      setCurrentMixId(id);
      setCurrentTime(0);
      setDuration(0);
      audio.src = assetUrl(mixes[id].audio);
    }
    setError(null);
    return playAudio(audio);
  }, [playAudio, captureAuthSession, clearInvalidatedSession]);

  useEffect(() => { playMixRef.current = playMix; }, [playMix]);

  const subscribeAutoNext = useCallback((listener) => {
    autoNextListenersRef.current.add(listener);
    return () => autoNextListenersRef.current.delete(listener);
  }, []);

  const pause = useCallback(() => {
    ++playRequestRef.current;
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      pause();
      return Promise.resolve(false);
    }
    return playMix(mixIdRef.current);
  }, [pause, playMix]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || !Number.isFinite(time)) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration));
    setCurrentTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((value) => {
    const next = Math.max(0, Math.min(1, Number(value)));
    if (!Number.isFinite(next)) return;
    if (next > 0) lastAudibleRef.current = next;
    volumeRef.current = next;
    mutedRef.current = next === 0;
    if (audioRef.current) {
      audioRef.current.volume = next;
      audioRef.current.muted = next === 0;
      syncAudioSpectrumMute(audioRef.current);
    }
    setVolumeState(next);
    setIsMuted(next === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    const muted = audio ? audio.muted || audio.volume === 0 : isMuted || volume === 0;
    if (muted && volume === 0) {
      setVolume(lastAudibleRef.current);
    } else {
      mutedRef.current = !muted;
      if (audio) {
        audio.muted = !muted;
        syncAudioSpectrumMute(audio);
      }
      setIsMuted(!muted);
    }
  }, [isMuted, volume, setVolume]);

  // 單曲循環與自動下一首互斥，避免曲終時產生兩種跳轉行為。
  const toggleLoop = useCallback(() => {
    const next = !modesRef.current.isLooping;
    modesRef.current = { isLooping: next, autoNext: next ? false : modesRef.current.autoNext };
    if (audioRef.current) audioRef.current.loop = next;
    setIsLooping(next);
    setAutoNext(modesRef.current.autoNext);
  }, []);

  const toggleAutoNext = useCallback(() => {
    const next = !modesRef.current.autoNext;
    modesRef.current = { isLooping: next ? false : modesRef.current.isLooping, autoNext: next };
    if (audioRef.current) audioRef.current.loop = modesRef.current.isLooping;
    setIsLooping(modesRef.current.isLooping);
    setAutoNext(next);
  }, []);

  const skip = useCallback((direction) => {
    const index = mixIds.indexOf(mixIdRef.current);
    return playMix(mixIds[(index + direction + mixIds.length) % mixIds.length]);
  }, [playMix]);
  const skipNext = useCallback(() => skip(1), [skip]);
  const skipPrevious = useCallback(() => skip(-1), [skip]);

  // Provider 卸載時移除事件、音訊來源與頻譜連線，避免殘留播放資源。
  useEffect(() => () => {
    ++playRequestRef.current;
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    Object.entries(listenersRef.current ?? {}).forEach(([event, handler]) => audio.removeEventListener(event, handler));
    releaseAudioSpectrum(audio);
    audio.removeAttribute('src');
    listenersRef.current = null;
    autoNextListenersRef.current.clear();
    audioRef.current = null;
  }, []);

  const value = useMemo(() => ({ currentMixId, isPlaying, hasPlayed, currentTime, duration, volume,
    isMuted, isLooping, autoNext, error, playlist, audioRef, playMix, togglePlay, pause,
    seek, setVolume, toggleMute, toggleLoop, toggleAutoNext, skipNext, skipPrevious,
    subscribeAutoNext, historyVersion }),
  [currentMixId, isPlaying, hasPlayed, currentTime, duration, volume, isMuted, isLooping, autoNext,
    error, playMix, togglePlay, pause, seek, setVolume, toggleMute, toggleLoop,
    toggleAutoNext, skipNext, skipPrevious, subscribeAutoNext, historyVersion]);

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>;
}
