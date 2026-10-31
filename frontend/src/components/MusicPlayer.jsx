
import { useEffect, useRef, useState } from 'react';
import useAudioSpectrum from '../pages/useAudioSpectrum.js';
import useLanguage from '../hooks/useLanguage.js';
import useMusicPlayer from '../hooks/useMusicPlayer.js';
import { assetUrl } from '../utils/assetUrl.js';

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '00:00';

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function MusicPlayer({ visualizerRef }) {
    const { language, t } = useLanguage();
    const english = language === 'en';
    const { currentMixId, playlist, audioRef, isPlaying, currentTime, duration,
        isLooping, autoNext, volume, isMuted, togglePlay, playMix, skipPrevious,
        skipNext, seek, setVolume, toggleMute, toggleLoop, toggleAutoNext } = useMusicPlayer();
    const currentMix = playlist.find(({ id }) => id === currentMixId);
    const ensureSpectrum = useAudioSpectrum(audioRef, visualizerRef, isPlaying);
    const [playlistOpen, setPlaylistOpen] = useState(false);
    const panelRef = useRef(null);
    const toggleRef = useRef(null);

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
        if (!isPlaying) {
            togglePlay();
            ensureSpectrum();
        } else {
            togglePlay();
        }
    }

    function changeProgress(event) {
        seek(Number(event.target.value));
    }

    function changeVolume(event) {
        setVolume(Number(event.target.value));
    }

    function handleSkip(skip) {
        skip();
        ensureSpectrum();
    }

    function handleSelect(id) {
        playMix(id);
        ensureSpectrum();
        setPlaylistOpen(false);
    }

    return (
        <div className="signature-mini-player" aria-label={`${currentMixId} Mini Player`}>
            <div className="signature-mini-header">
                <div className="signature-mini-copy">
                    <span id="signature-mini-kicker">NOW PLAYING · {currentMixId}</span>
                    <strong id="signature-mini-title">
                        {currentMix?.title}
                    </strong>
                </div>

                <div className="signature-transport">
                    <button className="signature-skip" type="button" onClick={() => handleSkip(skipPrevious)}
                        aria-label={english ? 'Previous Mix' : '上一首 Mix'} title={english ? 'Previous Mix' : '上一首 Mix'}>
                        <span aria-hidden="true">←</span>
                    </button>
                    <button
                        className={`signature-play ${isPlaying ? 'is-playing' : ''}`}
                        type="button"
                        aria-label={isPlaying ? (english ? 'Pause music' : '暫停音樂') : (english ? 'Play music' : '播放音樂')}
                        aria-pressed={isPlaying}
                        onClick={handlePlay}
                    >
                        <span className="play-icon" aria-hidden="true" />
                    </button>
                    <button className="signature-skip" type="button" onClick={() => handleSkip(skipNext)}
                        aria-label={english ? 'Next Mix' : '下一首 Mix'} title={english ? 'Next Mix' : '下一首 Mix'}>
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>

            <div className="signature-player">
                <label className="visually-hidden" htmlFor="player-progress">
                    {t('a11y.progress')}
                </label>

                <input
                    id="player-progress"
                    className="signature-progress"
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    step="0.1"
                    onChange={changeProgress}
                    style={{
                        '--progress-percent': `${duration ? (currentTime / duration) * 100 : 0}%`
                    }}
                />

                <div className="signature-mini-footer">
                    <div className="signature-time" aria-label={t('a11y.time')}>
                        <span className="player-time" id="current-time">
                            {formatTime(currentTime)}
                        </span>
                        <span aria-hidden="true">/</span>
                        <span className="player-time" id="total-time">
                            {formatTime(duration)}
                        </span>
                    </div>

                    <div className="signature-secondary-controls">
                        <button className="signature-extra-control" type="button" onClick={toggleAutoNext}
                            aria-label={autoNext ? (english ? 'Disable auto next' : '關閉自動下一首') : (english ? 'Enable auto next' : '開啟自動下一首')}
                            title={english ? 'Auto next' : '自動下一首'} aria-pressed={autoNext}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 6 8 6-8 6V6m8 0 8 6-8 6V6" /></svg>
                        </button>
                        <button
                            className={`signature-loop ${isLooping ? 'is-active' : ''}`}
                            type="button"
                            aria-label={english ? 'Loop playback' : '循環播放'}
                            aria-pressed={isLooping}
                            title={english ? 'Loop playback' : '循環播放'}
                            onClick={toggleLoop}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3M11 10h1v4" />
                            </svg>
                        </button>

                        <button className="signature-extra-control signature-playlist-toggle" type="button" ref={toggleRef}
                            aria-label={english ? `${playlistOpen ? 'Close' : 'Open'} playlist` : `${playlistOpen ? '關閉' : '開啟'}播放清單`}
                            title={english ? 'Playlist' : '播放清單'} aria-expanded={playlistOpen}
                            onClick={() => setPlaylistOpen((open) => !open)}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                        </button>

                        <div className="signature-volume">
                            <button
                                className="signature-volume-toggle"
                                type="button"
                                aria-label={isMuted ? (english ? 'Unmute' : '取消靜音') : (english ? 'Mute' : '靜音')}
                                aria-pressed={isMuted}
                                title={isMuted ? (english ? 'Unmute' : '取消靜音') : (english ? 'Mute' : '靜音')}
                                onClick={toggleMute}
                            >
                                <svg className="signature-volume-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 9v6h4l5 4V5L9 9H5" />
                                    <path className="volume-wave" d="M17 9.5a4 4 0 0 1 0 5" />
                                    <path className="volume-wave" d="M19.5 7a7.5 7.5 0 0 1 0 10" />
                                    <path className="volume-x" d="m17 9 5 6m0-6-5 6" />
                                </svg>
                            </button>

                            <label className="visually-hidden" htmlFor="signature-volume">
                                {english ? 'Volume' : '音量'}
                            </label>

                            <input
                                id="signature-volume"
                                className="signature-volume-slider"
                                type="range"
                                min="0"
                                max="1"
                                value={volume}
                                step="0.01"
                                aria-label={t('a11y.volume')}
                                onChange={changeVolume}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <aside className="detail-playlist-panel signature-playlist-panel" aria-label={english ? 'NOIRSON playlist' : 'NOIRSON 播放清單'}
                hidden={!playlistOpen} ref={panelRef}>
                <div className="detail-playlist-header">
                    <div><span>{english ? 'PLAYLIST' : '播放清單'}</span><strong>NOIRSON MIXES</strong></div>
                    <button className="detail-playlist-close" type="button" aria-label={english ? 'Close playlist' : '關閉播放清單'}
                        onClick={() => setPlaylistOpen(false)}>×</button>
                </div>
                <div className="detail-playlist-list" data-home-playlist-scroll>
                    {playlist.map(({ id, title, series, cover }) => <button key={id} type="button"
                        className={`detail-playlist-item signature-playlist-item ${id === currentMixId ? 'is-active' : ''}`}
                        aria-current={id === currentMixId ? 'true' : undefined}
                        onClick={() => handleSelect(id)}>
                        <img src={assetUrl(cover)} alt="" />
                        <span className="detail-playlist-item-copy"><strong>{id} · {title}</strong><small>{series}</small></span>
                    </button>)}
                </div>
            </aside>
        </div>
    );
}

export default MusicPlayer;
