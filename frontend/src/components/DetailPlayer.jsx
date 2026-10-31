import useMusicPlayer from '../hooks/useMusicPlayer.js';

export default function DetailPlayer({ pageMixId, mix, english }) {
  const { currentMixId, isPlaying, playMix, togglePlay } = useMusicPlayer();
  const playing = pageMixId === currentMixId && isPlaying;

  function handlePlay() {
    if (pageMixId === currentMixId) togglePlay();
    else playMix(pageMixId);
  }

  return <button className={`signature-play detail-play ${playing ? 'is-playing' : ''}`} type="button"
    aria-label={`${playing ? (english ? 'Pause' : '暫停') : (english ? 'Play' : '播放')} ${mix.title}`}
    aria-pressed={playing} onClick={handlePlay}>
    <span className="play-icon" aria-hidden="true" />
  </button>;
}
