import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import useLanguage from '../hooks/useLanguage.js';
import useMusicPlayer from '../hooks/useMusicPlayer.js';
import { ensureAudioSpectrum } from '../pages/useAudioSpectrum.js';
import { assetUrl } from '../utils/assetUrl.js';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

const desktopPointer = '(min-width: 769px) and (hover: hover) and (pointer: fine)';
const phoneWidth = '(max-width: 430px)';
const dockWidth = '(max-width: 768px)';
const edgeGap = 12;

function clampPosition(x, y, player) {
  const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
  const minY = headerBottom + edgeGap;
  return {
    x: Math.max(edgeGap, Math.min(x, Math.max(edgeGap, window.innerWidth - player.offsetWidth - edgeGap))),
    y: Math.max(minY, Math.min(y, Math.max(minY, window.innerHeight - player.offsetHeight - edgeGap))),
  };
}

export default function MiniPlayer() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const { language, t } = useLanguage();
  const english = language === 'en';
  const { currentMixId, isPlaying, currentTime, duration, volume, isMuted, audioRef,
    isLooping, autoNext, playlist, togglePlay, skipPrevious, skipNext, seek,
    setVolume, toggleMute, toggleLoop, toggleAutoNext, playMix } = useMusicPlayer();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [mode, setMode] = useState(() => matchMedia(dockWidth).matches && (!matchMedia(phoneWidth).matches || !isHome) ? 'compact' : 'expanded');
  const [isPhone, setIsPhone] = useState(() => matchMedia(phoneWidth).matches);
  const [canDock, setCanDock] = useState(() => matchMedia(dockWidth).matches);
  const [playlistLayout, setPlaylistLayout] = useState(null);
  const [position, setPosition] = useState(null);
  const [canDrag, setCanDrag] = useState(() => matchMedia(desktopPointer).matches);
  const playerRef = useRef(null);
  const dragRef = useRef(null);
  const anchorRef = useRef(null);
  const previousPathRef = useRef(pathname);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const currentMix = playlist.find(({ id }) => id === currentMixId);
  const collapsed = mode !== 'expanded';
  const docked = canDock && mode === 'docked';

  useEffect(() => {
    const query = matchMedia(desktopPointer);
    const update = () => setCanDrag(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const query = matchMedia(phoneWidth);
    const update = () => {
      setIsPhone(query.matches);
    };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const query = matchMedia(dockWidth);
    const update = () => {
      setCanDock(query.matches);
      if (!query.matches) setMode((value) => value === 'docked' ? 'compact' : value);
    };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;
    if (isPhone && previousPath === '/' && pathname !== '/') {
      setPlaylistOpen(false);
      setMode('compact');
    }
  }, [pathname, isPhone]);

  useLayoutEffect(() => {
    if (!canDrag || !position || !playerRef.current) return;
    if (anchorRef.current) {
      const anchor = anchorRef.current;
      anchorRef.current = null;
      const rightAlignedX = anchor.right - playerRef.current.offsetWidth;
      const x = collapsed || rightAlignedX >= edgeGap ? rightAlignedX : anchor.left;
      const next = clampPosition(x, anchor.top, playerRef.current);
      if (next.x !== position.x || next.y !== position.y) {
        setPosition(next);
        return;
      }
    }
    const correctPosition = () => {
      const next = clampPosition(position.x, position.y, playerRef.current);
      if (next.x !== position.x || next.y !== position.y) setPosition(next);
    };
    correctPosition();
    window.addEventListener('resize', correctPosition);
    return () => window.removeEventListener('resize', correctPosition);
  }, [canDrag, collapsed, pathname, position]);

  useLayoutEffect(() => {
    if (!playlistOpen || !playerRef.current || !panelRef.current) return;
    const update = () => {
      const player = playerRef.current.getBoundingClientRect();
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
      const above = Math.max(0, player.top - headerBottom - edgeGap * 2);
      const below = Math.max(0, window.innerHeight - player.bottom - edgeGap * 2);
      const direction = below >= 420 || below >= above ? 'down' : 'up';
      const height = Math.min(420, direction === 'down' ? below : above);
      const width = panelRef.current.offsetWidth;
      const left = Math.max(edgeGap, Math.min(player.right - width, window.innerWidth - width - edgeGap));
      const headerHeight = panelRef.current.querySelector('.detail-playlist-header')?.offsetHeight ?? 70;
      const next = { direction, height, listHeight: Math.max(0, height - headerHeight - 2), left: left - player.left };
      setPlaylistLayout((previous) => previous && Object.keys(next).every((key) => previous[key] === next[key]) ? previous : next);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [playlistOpen, pathname, position, collapsed]);

  function startDrag(event) {
    if (!canDrag || event.button !== 0 || !playerRef.current) return;
    const rect = playerRef.current.getBoundingClientRect();
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: rect.left, y: rect.top, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !playerRef.current) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    drag.moved = true;
    setPosition(clampPosition(drag.x + dx, drag.y + dy, playerRef.current));
  }

  function endDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function toggleCollapsed() {
    if (canDrag && position && playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      anchorRef.current = { left: rect.left, right: rect.right, top: rect.top };
    }
    if (!collapsed) setPlaylistOpen(false);
    setMode((value) => value === 'expanded' ? 'compact' : 'expanded');
  }

  function resetPosition() {
    anchorRef.current = null;
    setPosition(null);
  }

  useEffect(() => {
    if (!playlistOpen) return;
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
  }, [playlistOpen]);

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

  if (docked) return <aside className="global-mini-player is-docked" aria-label={english ? 'Music mini player' : '音樂迷你播放器'}>
    <button className="global-mini-dock-button" type="button" onClick={() => setMode('compact')}
      aria-label={english ? 'Restore compact player' : '恢復精簡播放器'}
      title={english ? 'Restore compact player' : '恢復精簡播放器'} aria-expanded="false">♫</button>
  </aside>;

  return <aside ref={playerRef} className={`global-mini-player ${collapsed ? 'is-collapsed' : ''} ${canDrag && position ? 'is-positioned' : ''}`}
    style={canDrag && position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined}
    aria-label={english ? 'Music mini player' : '音樂迷你播放器'}>
    <div className="global-mini-toolbar">
      <span className="global-mini-drag-handle" role="img" aria-label={english ? 'Drag player' : '拖曳播放器'}
        onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
        aria-hidden={!canDrag} />
      <button className="global-mini-control global-mini-reset" type="button" onClick={resetPosition}
        aria-label={english ? 'Reset player position' : '重設播放器位置'}
        title={english ? 'Reset player position' : '重設播放器位置'}>↺</button>
      <button className="global-mini-control global-mini-collapse" type="button" onClick={toggleCollapsed}
        aria-label={collapsed ? (english ? 'Expand player' : '展開播放器') : (english ? 'Collapse player' : '收合播放器')}
        title={collapsed ? (english ? 'Expand player' : '展開播放器') : (english ? 'Collapse player' : '收合播放器')}
        aria-expanded={!collapsed}>{collapsed ? '□' : '−'}</button>
    </div>
    {collapsed ? <div className="global-mini-collapsed-main">
      <img className="global-mini-cover" src={assetUrl(currentMix.cover)} alt="" />
      <button className={`signature-play global-mini-play ${isPlaying ? 'is-playing' : ''}`} type="button"
        aria-label={isPlaying ? (english ? 'Pause music' : '暫停音樂') : (english ? 'Play music' : '播放音樂')}
        aria-pressed={isPlaying} onClick={handlePlay}><span className="play-icon" aria-hidden="true" /></button>
      {canDock && <button className="global-mini-control global-mini-dock-toggle" type="button"
        onClick={() => setMode('docked')} aria-label={english ? 'Dock player to side' : '貼附播放器至側邊'}
        title={english ? 'Dock player to side' : '貼附播放器至側邊'}>⇥</button>}
    </div> : <>
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
      style={playlistOpen && playlistLayout ? { position: 'absolute', top: playlistLayout.direction === 'down' ? 'calc(100% + 12px)' : 'auto',
        bottom: playlistLayout.direction === 'up' ? 'calc(100% + 12px)' : 'auto', left: playlistLayout.left,
        right: 'auto', maxHeight: playlistLayout.height } : undefined}
      aria-label={english ? 'NOIRSON playlist' : 'NOIRSON 播放清單'}>
      <div className="detail-playlist-header">
        <div><span>{english ? 'PLAYLIST' : '播放清單'}</span><strong>NOIRSON MIXES</strong></div>
        <button className="detail-playlist-close" type="button" aria-label={english ? 'Close playlist' : '關閉播放清單'}
          onClick={() => setPlaylistOpen(false)}>×</button>
      </div>
      <div className="detail-playlist-list global-mini-playlist-list" data-home-playlist-scroll
        style={playlistOpen && playlistLayout ? { maxHeight: playlistLayout.listHeight } : undefined}>
        {playlist.map(({ id, title, series, cover }) => <button key={id} type="button"
          className={`detail-playlist-item global-mini-playlist-item ${id === currentMixId ? 'is-active' : ''}`}
          aria-current={id === currentMixId ? 'true' : undefined}
          onClick={() => handleSelect(id)}>
          <img src={assetUrl(cover)} alt="" />
          <span className="detail-playlist-item-copy"><strong>{id} · {title}</strong><small>{series}</small></span>
        </button>)}
      </div>
    </div>
    </>}
  </aside>;
}
