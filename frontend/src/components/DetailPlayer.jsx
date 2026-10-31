import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { assetUrl } from '../utils/assetUrl.js';
import useMusicPlayer from '../hooks/useMusicPlayer.js';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function DetailPlayer({ pageMixId, mix, english }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const { currentMixId, isPlaying, currentTime, duration, volume, isMuted,
    isLooping, autoNext, playlist, playMix, togglePlay, seek, setVolume,
    toggleMute, toggleLoop, toggleAutoNext, subscribeAutoNext } = useMusicPlayer();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const mixIds = playlist.map(({ id }) => id);
  const currentIndex = mixIds.indexOf(pageMixId);
  const previousId = mixIds[(currentIndex - 1 + mixIds.length) % mixIds.length];
  const nextId = mixIds[(currentIndex + 1) % mixIds.length];
  const isCurrentMix = pageMixId === currentMixId;
  const playing = isCurrentMix && isPlaying;
  const shownTime = isCurrentMix ? currentTime : 0;
  const shownDuration = isCurrentMix ? duration : 0;

  useEffect(() => subscribeAutoNext((id) => navigate(`/music/${id}`)), [subscribeAutoNext, navigate]);

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

  function handlePlay() {
    if (isCurrentMix) togglePlay();
    else playMix(pageMixId);
  }

  function handleSeek(event) {
    if (isCurrentMix) seek(Number(event.target.value));
  }

  function changeVolume(event) {
    setVolume(Number(event.target.value));
  }

  return <div className="detail-player" aria-label={english ? 'Mix player' : 'Mix 播放器'}>
    <div className="detail-player-controls">
      <Link className="detail-skip detail-previous" to={`/music/${previousId}`} onClick={() => playMix(previousId)} aria-label={english ? 'Previous Mix' : '上一首 Mix'}><span aria-hidden="true">←</span></Link>
      <button className={`signature-play detail-play ${playing ? 'is-playing' : ''}`} type="button"
        aria-label={`${playing ? (english ? 'Pause' : '暫停') : (english ? 'Play' : '播放')} ${mix.title}`} aria-pressed={playing} onClick={handlePlay}>
        <span className="play-icon" aria-hidden="true" />
      </button>
      <Link className="detail-skip detail-next" to={`/music/${nextId}`} onClick={() => playMix(nextId)} aria-label={english ? 'Next Mix' : '下一首 Mix'}><span aria-hidden="true">→</span></Link>
    </div>
    <div className="detail-player-timeline">
      <label className="visually-hidden" htmlFor="detail-progress">{english ? 'Music progress' : '音樂播放進度'}</label>
      <input id="detail-progress" className="signature-progress" type="range" min="0" max={shownDuration || 100}
        value={shownTime} step="0.1" onChange={handleSeek} disabled={!isCurrentMix}
        style={{ '--progress': `${shownDuration ? shownTime / shownDuration * 100 : 0}%` }} />
      <div className="detail-player-times"><span>{formatTime(shownTime)}</span><span>{formatTime(shownDuration)}</span></div>
    </div>
    <button className="detail-playlist-toggle" type="button" ref={toggleRef}
      aria-label={english ? `${playlistOpen ? 'Close' : 'Open'} playlist` : `${playlistOpen ? '關閉' : '開啟'}播放清單`} aria-expanded={playlistOpen}
      onClick={() => setPlaylistOpen((open) => !open)}>
      <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
    </button>
    <div className="detail-player-secondary" aria-label={english ? 'Playback mode and volume controls' : '播放模式與音量控制'}>
      <button className="detail-loop" type="button" aria-label={isLooping ? (english ? 'Disable loop' : '關閉循環播放') : (english ? 'Enable loop' : '開啟循環播放')}
        aria-pressed={isLooping} title={english ? 'Loop playback' : '循環播放'} onClick={toggleLoop}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4M12 9v6m-1.5-4.5L12 9" />
        </svg>
      </button>
      <div className="detail-volume">
        <button className="detail-volume-toggle" type="button" aria-label={isMuted || volume === 0 ? (english ? 'Unmute' : '解除靜音') : (english ? 'Mute' : '靜音')}
          aria-pressed={isMuted || volume === 0} title={isMuted || volume === 0 ? (english ? 'Unmute' : '解除靜音') : (english ? 'Mute' : '靜音')} onClick={toggleMute}>
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
        {playlist.map(({ id, ...item }) => <Link key={id} to={`/music/${id}`}
          className={`detail-playlist-item ${id === currentMixId ? 'is-active' : ''}`}
          aria-current={id === currentMixId ? 'true' : undefined} onClick={() => { playMix(id); setPlaylistOpen(false); }}>
          <img src={assetUrl(item.cover)} alt={english ? `${item.title} cover` : `${item.title} 音樂封面`} />
          <span className="detail-playlist-item-copy"><strong>{item.title}</strong><small>{item.series}</small></span>
        </Link>)}
      </div>
    </aside>
  </div>;
}
