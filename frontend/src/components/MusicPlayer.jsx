
import { useRef, useState } from 'react';
import { assetUrl } from '../utils/assetUrl.js';
import useAudioSpectrum from '../pages/useAudioSpectrum.js';
import useLanguage from '../hooks/useLanguage.js';

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '00:00';

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function MusicPlayer({ visualizerRef }) {
    const { language, t } = useLanguage();
    const english = language === 'en';
    const audioRef = useRef(null);
    const ensureSpectrum = useAudioSpectrum(audioRef, visualizerRef);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    function togglePlay() {
        const audio = audioRef.current;

        if (!audio) return;

        if (audio.paused) {
            ensureSpectrum();
            audio.play().catch(() => setIsPlaying(false));
        } else {
            audio.pause();
        }
    }

    function changeProgress(event) {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(audio.duration)) return;

        const time = Number(event.target.value);
        audio.currentTime = time;
        setCurrentTime(time);
    }

    function changeVolume(event) {
        const value = Number(event.target.value);
        const audio = audioRef.current;

        setVolume(value);

        if (audio) {
            audio.volume = value;
            audio.muted = false;
        }

        setIsMuted(false);
    }

    function toggleMute() {
        const audio = audioRef.current;
        if (!audio) return;

        audio.muted = !audio.muted;
        setIsMuted(audio.muted);
    }

    function toggleLoop() {
        setIsLooping((previous) => !previous);
    }

    return (
        <div className="signature-mini-player" aria-label="M001 Mini Player">
            <audio
                ref={audioRef}
                src={assetUrl('musicDemo/01-preview.mp3')}
                preload="metadata"
                loop={isLooping}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(event) => {
                    setDuration(event.currentTarget.duration);
                }}
                onTimeUpdate={(event) => {
                    setCurrentTime(event.currentTarget.currentTime);
                }}
            />

            <div className="signature-mini-header">
                <div className="signature-mini-copy">
                    <span id="signature-mini-kicker">NOW PLAYING · M001</span>
                    <strong id="signature-mini-title">
                        Somewhere far from everyone
                    </strong>
                </div>

                <button
                    className={`signature-play ${isPlaying ? 'is-playing' : ''}`}
                    type="button"
                    aria-label={isPlaying ? (english ? 'Pause music' : '暫停音樂') : (english ? 'Play music' : '播放音樂')}
                    aria-pressed={isPlaying}
                    onClick={togglePlay}
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
