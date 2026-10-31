import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import useLanguage from '../hooks/useLanguage.js';
import useMusicPlayer from '../hooks/useMusicPlayer.js';
import { ensureAudioSpectrum } from '../pages/useAudioSpectrum.js';
import { assetUrl } from '../utils/assetUrl.js';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function MiniPlayer() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const { language, t } = useLanguage();
  const english = language === 'en';
  const { hasPlayed, currentMixId, isPlaying, currentTime, duration, volume, isMuted, audioRef,
    isLooping, autoNext, playlist, togglePlay, skipPrevious, skipNext, seek,
    setVolume, toggleMute, toggleLoop, toggleAutoNext, playMix } = useMusicPlayer();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const visible = isHome || hasPlayed;
  const currentMix = playlist.find(({ id }) => id === currentMixId);

  useEffect(() => {
    if (!visible || !playlistOpen) return;
    const onOutsideClick = (event) => {
      if (!panelRef.current?.contains(event.target) && !toggleRef.current?.contains(event.target)) {
        setPlaylistOpen(false);
      }
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') setPlaylistOpen(false);
    };
    document.addEventListener('click', onOutsideClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('click', onOutsideClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [visible, playlistOpen]);

  function handlePlay() {
    togglePlay();
    if (isHome && !isPlaying) ensureAudioSpectrum(audioRef.current);
  }

  function handleSkip(skip) {
    skip();
    if (isHome) ensureAudioSpectrum(audioRef.current);
  }

  function handleSelect(id) {
    playMix(id);
    if (isHome) ensureAudioSpectrum(audioRef.current);
    setPlaylistOpen(false);
  }

  if (!visible) return null;

  return <aside className="global-mini-player" aria-label={english ? 'Music mini player' : '音樂迷你播放器'}>
    <div className="global-mini-main">
      <img className="global-mini-cover" src={assetUrl(currentMix.cover)} alt="" />
      <div className="global-mini-copy">
        <span>{currentMixId} · NOIRSON MIX</span>
        <strong>{currentMix.title}</strong>
      </div>
      <div className="global-mini-transport">
        <button className="global-mini-control" type="button" onClick={() => handleSkip(skipPrevious)}
          aria-label={english ? 'Previous Mix' : '上一首 Mix'} title={english ? 'Previous Mix' : '上一首 Mix'}>←</button>
        <button className={`signature-play global-mini-play ${isPlaying ? 'is-playing' : ''}`} type="button"
          aria-label={isPlaying ? (english ? 'Pause music' : '暫停音樂') : (english ? 'Play music' : '播放音樂')}
          aria-pressed={isPlaying} onClick={handlePlay}><span className="play-icon" aria-hidden="true" /></button>
        <button className="global-mini-control" type="button" onClick={() => handleSkip(skipNext)}
          aria-label={english ? 'Next Mix' : '下一首 Mix'} title={english ? 'Next Mix' : '下一首 Mix'}>→</button>
      </div>
    </div>
    <div className="global-mini-progress">
      <label className="visually-hidden" htmlFor="global-mini-progress">{t('a11y.progress')}</label>
      <input id="global-mini-progress" className="signature-progress" type="range" min="0" max={duration || 100}
        value={currentTime} step="0.1" onChange={(event) => seek(Number(event.target.value))}
        style={{ '--progress': `${duration ? currentTime / duration * 100 : 0}%` }} />
      <div className="global-mini-times"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
    </div>
    <div className="global-mini-secondary">
      <div className="global-mini-modes">
        <button className="global-mini-control" type="button" onClick={toggleLoop}
          aria-label={isLooping ? (english ? 'Disable loop' : '關閉循環播放') : (english ? 'Enable loop' : '開啟循環播放')}
          title={english ? 'Loop playback' : '循環播放'} aria-pressed={isLooping}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3M11 10h1v4" /></svg>
        </button>
        <button className="global-mini-control" type="button" onClick={toggleAutoNext}
          aria-label={autoNext ? (english ? 'Disable auto next' : '關閉自動下一首') : (english ? 'Enable auto next' : '開啟自動下一首')}
          title={english ? 'Auto next' : '自動下一首'} aria-pressed={autoNext}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 6 8 6-8 6V6m8 0 8 6-8 6V6" /></svg>
        </button>
        <button className="global-mini-control" type="button" ref={toggleRef}
          aria-label={english ? `${playlistOpen ? 'Close' : 'Open'} playlist` : `${playlistOpen ? '關閉' : '開啟'}播放清單`}
          title={english ? 'Playlist' : '播放清單'} aria-expanded={playlistOpen}
          onClick={() => setPlaylistOpen((open) => !open)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
      <div className="global-mini-volume">
        <button className="global-mini-control" type="button" onClick={toggleMute}
          aria-label={isMuted || volume === 0 ? (english ? 'Unmute' : '解除靜音') : (english ? 'Mute' : '靜音')}
          title={isMuted || volume === 0 ? (english ? 'Unmute' : '解除靜音') : (english ? 'Mute' : '靜音')}
          aria-pressed={isMuted || volume === 0}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9H5" /><path d={isMuted || volume === 0 ? 'm17 9 5 6m0-6-5 6' : 'M17 9.5a4 4 0 0 1 0 5M19.5 7a7 7 0 0 1 0 10'} /></svg>
        </button>
        <label className="visually-hidden" htmlFor="global-mini-volume">{t('a11y.volume')}</label>
        <input id="global-mini-volume" className="signature-volume-slider" type="range" min="0" max="1" step="0.01"
          value={volume} onChange={(event) => setVolume(Number(event.target.value))}
          style={{ '--volume': `${volume * 100}%` }} />
      </div>
    </div>
    <div className="detail-playlist-panel global-mini-playlist-panel" hidden={!playlistOpen} ref={panelRef}
      aria-label={english ? 'NOIRSON playlist' : 'NOIRSON 播放清單'}>
      <div className="detail-playlist-header">
        <div><span>{english ? 'PLAYLIST' : '播放清單'}</span><strong>NOIRSON MIXES</strong></div>
        <button className="detail-playlist-close" type="button" aria-label={english ? 'Close playlist' : '關閉播放清單'}
          onClick={() => setPlaylistOpen(false)}>×</button>
      </div>
      <div className="detail-playlist-list global-mini-playlist-list" data-home-playlist-scroll>
        {playlist.map(({ id, title, series, cover }) => <button key={id} type="button"
          className={`detail-playlist-item global-mini-playlist-item ${id === currentMixId ? 'is-active' : ''}`}
          aria-current={id === currentMixId ? 'true' : undefined}
          onClick={() => handleSelect(id)}>
          <img src={assetUrl(cover)} alt="" />
          <span className="detail-playlist-item-copy"><strong>{id} · {title}</strong><small>{series}</small></span>
        </button>)}
      </div>
    </div>
  </aside>;
}
