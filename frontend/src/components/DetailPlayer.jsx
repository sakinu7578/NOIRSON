import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import mixes from '../data/mixData.js';
import { assetUrl } from '../utils/assetUrl.js';

const mixIds = Object.keys(mixes);
const loopKey = 'noirson-detail-loop';
const autoNextKey = 'noirson-detail-auto-next';
const autoplayKey = 'noirson-detail-autoplay';

function readSaved(key) {
  try { return sessionStorage.getItem(key) === 'true'; } catch { return false; }
}

function saveModes(loop, autoNext) {
  try {
    sessionStorage.setItem(loopKey, String(loop));
    sessionStorage.setItem(autoNextKey, String(autoNext));
  } catch { /* Controls still work without storage. */ }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function DetailPlayer({ mixId, mix, english }) {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const lastAudibleRef = useRef(1);
  const autoplayPendingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(() => readSaved(loopKey));
  const [autoNext, setAutoNext] = useState(() => !readSaved(loopKey) && readSaved(autoNextKey));
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const currentIndex = mixIds.indexOf(mixId);
  const previousId = mixIds[(currentIndex - 1 + mixIds.length) % mixIds.length];
  const nextId = mixIds[(currentIndex + 1) % mixIds.length];

  useEffect(() => {
    const audio = audioRef.current;
    let pending = autoplayPendingRef.current;
    try {
      pending = pending || sessionStorage.getItem(autoplayKey) === 'true';
      sessionStorage.removeItem(autoplayKey);
    } catch { /* Autoplay simply falls back to a manual click. */ }
    autoplayPendingRef.current = pending;
    if (pending && readSaved(autoNextKey) && !readSaved(loopKey)) audio.play().catch(() => setPlaying(false));
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
    if (!playlistOpen) return;
    const onOutsideClick = (event) => {
      if (!panelRef.current?.contains(event.target) && !toggleRef.current?.contains(event.target)) {
        setPlaylistOpen(false);
      }
    };
    document.addEventListener('click', onOutsideClick);
    return () => document.removeEventListener('click', onOutsideClick);
  }, [playlistOpen]);

  function togglePlay() {
    const audio = audioRef.current;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = Number(event.target.value);
    setCurrentTime(audio.currentTime);
  }

  function changeVolume(event) {
    const value = Number(event.target.value);
    if (value > 0) lastAudibleRef.current = value;
    else if (volume > 0) lastAudibleRef.current = volume;
    audioRef.current.volume = value;
    audioRef.current.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (muted || volume === 0) {
      const restored = volume === 0 ? lastAudibleRef.current : volume;
      audio.volume = restored;
      audio.muted = false;
      setVolume(restored);
      setMuted(false);
    } else {
      lastAudibleRef.current = volume;
      audio.muted = true;
      setMuted(true);
    }
  }

  function toggleLoop() {
    const next = !loop;
    setLoop(next);
    if (next) setAutoNext(false);
    saveModes(next, next ? false : autoNext);
  }

  function toggleAutoNext() {
    const next = !autoNext;
    setAutoNext(next);
    if (next) setLoop(false);
    saveModes(next ? false : loop, next);
  }

  function handleEnded() {
    setPlaying(false);
    if (!autoNext || loop) return;
    try { sessionStorage.setItem(autoplayKey, 'true'); } catch { /* Navigation still occurs. */ }
    navigate(`/music/${nextId}`);
  }

  return <div className="detail-player" aria-label={english ? 'Mix player' : 'Mix 播放器'}>
    <div className="detail-player-controls">
      <Link className="detail-skip detail-previous" to={`/music/${previousId}`} aria-label={english ? 'Previous Mix' : '上一首 Mix'}><span aria-hidden="true">←</span></Link>
      <button className={`signature-play detail-play ${playing ? 'is-playing' : ''}`} type="button"
        aria-label={`${playing ? (english ? 'Pause' : '暫停') : (english ? 'Play' : '播放')} ${mix.title}`} aria-pressed={playing} onClick={togglePlay}>
        <span className="play-icon" aria-hidden="true" />
      </button>
      <Link className="detail-skip detail-next" to={`/music/${nextId}`} aria-label={english ? 'Next Mix' : '下一首 Mix'}><span aria-hidden="true">→</span></Link>
    </div>
    <div className="detail-player-timeline">
      <label className="visually-hidden" htmlFor="detail-progress">{english ? 'Music progress' : '音樂播放進度'}</label>
      <input id="detail-progress" className="signature-progress" type="range" min="0" max={duration || 100}
        value={currentTime} step="0.1" onChange={seek}
        style={{ '--progress': `${duration ? currentTime / duration * 100 : 0}%` }} />
      <div className="detail-player-times"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
    </div>
    <button className="detail-playlist-toggle" type="button" ref={toggleRef}
      aria-label={english ? `${playlistOpen ? 'Close' : 'Open'} playlist` : `${playlistOpen ? '關閉' : '開啟'}播放清單`} aria-expanded={playlistOpen}
      onClick={() => setPlaylistOpen((open) => !open)}>
      <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
    </button>
    <div className="detail-player-secondary" aria-label={english ? 'Playback mode and volume controls' : '播放模式與音量控制'}>
      <button className="detail-loop" type="button" aria-label={loop ? (english ? 'Disable loop' : '關閉循環播放') : (english ? 'Enable loop' : '開啟循環播放')}
        aria-pressed={loop} title={english ? 'Loop playback' : '循環播放'} onClick={toggleLoop}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4M12 9v6m-1.5-4.5L12 9" />
        </svg>
      </button>
      <div className="detail-volume">
        <button className="detail-volume-toggle" type="button" aria-label={muted || volume === 0 ? (english ? 'Unmute' : '解除靜音') : (english ? 'Mute' : '靜音')}
          aria-pressed={muted || volume === 0} title={muted || volume === 0 ? (english ? 'Unmute' : '解除靜音') : (english ? 'Mute' : '靜音')} onClick={toggleMute}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 9v6h4l5 4V5L9 9H5" /><path className="volume-wave" d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7 7 0 0 1 0 10" />
            <path className="volume-x" d="m17 9 5 6m0-6-5 6" />
          </svg>
        </button>
        <label className="visually-hidden" htmlFor="detail-volume">{english ? 'Volume' : '音量'}</label>
        <input id="detail-volume" className="detail-volume-slider" type="range" min="0" max="1" step="0.01"
          value={volume} onChange={changeVolume} style={{ '--volume': `${volume * 100}%` }} />
      </div>
      <button className="detail-auto-next" type="button" aria-label={autoNext ? (english ? 'Disable auto next' : '關閉自動下一首') : (english ? 'Enable auto next' : '開啟自動下一首')}
        aria-pressed={autoNext} title={english ? 'Auto next' : '自動下一首'} onClick={toggleAutoNext}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 6 8 6-8 6V6m8 0 8 6-8 6V6" /></svg>
      </button>
    </div>
    <aside className="detail-playlist-panel" aria-label={english ? 'NOIRSON playlist' : 'NOIRSON 播放清單'} hidden={!playlistOpen} ref={panelRef}>
      <div className="detail-playlist-header">
        <div><span>{english ? 'PLAYLIST' : '播放清單'}</span><strong>NOIRSON MIXES</strong></div>
        <button className="detail-playlist-close" type="button" aria-label={english ? 'Close playlist' : '關閉播放清單'} onClick={() => setPlaylistOpen(false)}>×</button>
      </div>
      <div className="detail-playlist-list">
        {Object.entries(mixes).map(([id, item]) => <Link key={id} to={`/music/${id}`}
          className={`detail-playlist-item ${id === mixId ? 'is-active' : ''}`}
          aria-current={id === mixId ? 'page' : undefined} onClick={() => setPlaylistOpen(false)}>
          <img src={assetUrl(item.cover)} alt={english ? `${item.title} cover` : `${item.title} 音樂封面`} />
          <span className="detail-playlist-item-copy"><strong>{item.title}</strong><small>{item.series}</small></span>
        </Link>)}
      </div>
    </aside>
    <audio ref={audioRef} src={assetUrl(mix.audio)} loop={loop} preload="metadata"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={handleEnded}
      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} />
  </div>;
}
