
import useAudioSpectrum from '../pages/useAudioSpectrum.js';
import useLanguage from '../hooks/useLanguage.js';
import useMusicPlayer from '../hooks/useMusicPlayer.js';

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
        isLooping, volume, isMuted, togglePlay, seek, setVolume, toggleMute, toggleLoop } = useMusicPlayer();
    const currentMix = playlist.find(({ id }) => id === currentMixId);
    const ensureSpectrum = useAudioSpectrum(audioRef, visualizerRef, isPlaying);

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

    return (
        <div className="signature-mini-player" aria-label={`${currentMixId} Mini Player`}>
            <div className="signature-mini-header">
                <div className="signature-mini-copy">
                    <span id="signature-mini-kicker">NOW PLAYING · {currentMixId}</span>
                    <strong id="signature-mini-title">
                        {currentMix?.title}
                    </strong>
                </div>

                <button
                    className={`signature-play ${isPlaying ? 'is-playing' : ''}`}
                    type="button"
                    aria-label={isPlaying ? (english ? 'Pause music' : '暫停音樂') : (english ? 'Play music' : '播放音樂')}
                    aria-pressed={isPlaying}
                    onClick={handlePlay}
                >
                    <span className="play-icon" aria-hidden="true" />
                </button>
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
        </div>
    );
}

export default MusicPlayer;
