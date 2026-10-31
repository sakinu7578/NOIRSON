import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../utils/assetUrl.js';

const galleryImages = Array.from({ length: 17 }, (_, index) => `images/${String(index).padStart(2, '0')}.webp`);
const autoplayKey = 'noirson-detail-gallery-auto';

function initialAutoplay() {
  try { return sessionStorage.getItem(autoplayKey) !== 'false'; } catch { return true; }
}

export default function DetailGallery({ mix, english }) {
  const galleryRef = useRef(null);
  const activeLayerRef = useRef(0);
  const initialIndex = Math.max(0, galleryImages.indexOf(mix.cover));
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [activeLayer, setActiveLayer] = useState(0);
  const [layers, setLayers] = useState([mix.cover, mix.cover]);
  const [auto, setAuto] = useState(initialAutoplay);
  const [timerVersion, setTimerVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    const path = galleryImages[selectedIndex];
    const preload = new Image();
    const show = () => {
      if (cancelled) return;
      const nextLayer = 1 - activeLayerRef.current;
      setLayers((current) => current.map((src, index) => index === nextLayer ? path : src));
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (cancelled) return;
          activeLayerRef.current = nextLayer;
          setActiveLayer(nextLayer);
        });
      });
    };
    preload.addEventListener('load', show, { once: true });
    preload.src = assetUrl(path);
    if (preload.complete && preload.naturalWidth > 0) show();
    return () => {
      cancelled = true;
      preload.removeEventListener('load', show);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [selectedIndex]);

  useEffect(() => {
    const gallery = galleryRef.current;
    const thumb = gallery?.querySelectorAll('.detail-gallery-thumb')[selectedIndex];
    if (!thumb) return;
    const galleryRect = gallery.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    if (thumbRect.left >= galleryRect.left && thumbRect.right <= galleryRect.right) return;
    const left = gallery.scrollLeft + thumbRect.left - galleryRect.left - (gallery.clientWidth - thumb.offsetWidth) / 2;
    gallery.scrollTo({ left, behavior: 'smooth' });
  }, [selectedIndex]);

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      setSelectedIndex((index) => (index + 1) % galleryImages.length);
      setTimerVersion((version) => version + 1);
    }, 6000);
    return () => clearTimeout(timer);
  }, [auto, selectedIndex, timerVersion]);

  function select(index) {
    setSelectedIndex((index + galleryImages.length) % galleryImages.length);
    setTimerVersion((version) => version + 1);
  }

  function toggleAuto() {
    setAuto((current) => {
      const next = !current;
      try { sessionStorage.setItem(autoplayKey, String(next)); } catch { /* Current page still works. */ }
      return next;
    });
  }

  const altText = (path) => path === mix.cover
    ? `${mix.title} ${english ? 'main visual' : '主視覺'}` : `${mix.title} Gallery ${galleryImages.indexOf(path) + 1}`;

  return <div className="music-detail-media">
    <div className="music-detail-visual">
      {layers.map((path, layer) => <div key={layer}
        className={`detail-main-visual-layer ${layer === activeLayer ? 'is-active' : ''}`}
        style={{ zIndex: layer === activeLayer ? 1 : 0 }} aria-hidden={layer !== activeLayer}>
        <img src={assetUrl(path)} alt={layer === activeLayer ? altText(path) : ''} />
      </div>)}
    </div>
    <section className="detail-gallery-section" aria-labelledby="detail-gallery-title">
      <div className="detail-gallery-heading">
        <p className="section-label">{english ? 'VISUALS' : '影像'}</p>
        <div className="detail-gallery-title-row">
          <h2 id="detail-gallery-title">{english ? 'FROM THIS MIX' : '此 MIX 影像'}</h2>
          <button className="detail-gallery-auto" type="button" aria-pressed={auto}
            aria-label={auto ? (english ? 'Stop visuals autoplay' : '停止影像自動輪播') : (english ? 'Start visuals autoplay' : '開啟影像自動輪播')}
            title={english ? 'Visuals autoplay' : '自動輪播'} onClick={toggleAuto}>
            <span className="detail-gallery-auto-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="detail-gallery-controls">
        <button className="detail-gallery-arrow detail-gallery-previous" type="button"
          aria-label={english ? 'Browse gallery left' : '向左瀏覽 Gallery'} onClick={() => select(selectedIndex - 1)}>←</button>
        <div className="detail-gallery" ref={galleryRef}>
          {galleryImages.map((path, index) => <button key={path}
            className={`detail-gallery-thumb ${index === selectedIndex ? 'is-active' : ''}`}
            type="button" aria-label={english ? `Show gallery image ${index + 1}` : `顯示第 ${index + 1} 張 Gallery 圖片`}
            aria-pressed={index === selectedIndex} onClick={() => select(index)}>
            <img src={assetUrl(path)} alt={`${mix.title} Gallery ${index + 1}`} loading="lazy" />
          </button>)}
        </div>
        <button className="detail-gallery-arrow detail-gallery-next" type="button"
          aria-label={english ? 'Browse gallery right' : '向右瀏覽 Gallery'} onClick={() => select(selectedIndex + 1)}>→</button>
      </div>
    </section>
  </div>;
}
