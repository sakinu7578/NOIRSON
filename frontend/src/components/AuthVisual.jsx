import useBackgroundSlideshow from '../hooks/useBackgroundSlideshow.js';

const memberImages = [
  'images/05.webp',
  'images/06.webp',
  'images/10.webp',
  'images/12.webp',
];

export default function AuthVisual({ headingId, title, intro, membersLabel }) {
  const background = useBackgroundSlideshow({
    images: memberImages,
    interval: 8000,
    fadeDuration: 2000,
    overlap: true,
    respectReducedMotion: true,
  });

  return <section className="auth-visual" aria-labelledby={headingId}>
    <div className="auth-background" aria-hidden="true">
      {background.layers.map((image, layer) => {
        const visible = layer === background.activeLayer || layer === background.fadingFrom;
        return <div key={layer} className={`auth-background-layer ${visible ? 'is-active' : ''}`}
          style={{ backgroundImage: `url("${image}")`, zIndex: layer === background.activeLayer ? 1 : 0 }} />;
      })}
      <div className="auth-background-shade" />
    </div>
    <div className="auth-visual-copy">
      <p className="section-label">{membersLabel}</p>
      <h1 id={headingId}>{title.map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h1>
      <p>{intro}</p>
    </div>
  </section>;
}
