import { useEffect, useState } from 'react';
import { assetUrl } from '../utils/assetUrl.js';

const images = ['00', '01', '05', '04', '13', '14'].map((name) => assetUrl(`images/${name}.webp`));

export default function useHeroBackground() {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [layers, setLayers] = useState([images[0], images[0]]);

  useEffect(() => {
    let cancelled = false;
    const next = (index + 1) % images.length;
    const preload = new Image();
    let onLoad;
    const onError = () => { if (!cancelled) setIndex(next); };
    const timer = setTimeout(() => {
      const show = () => {
        if (cancelled) return;
        const nextLayer = 1 - active;
        setLayers((previous) => previous.map((src, layer) => layer === nextLayer ? images[next] : src));
        setActive(nextLayer);
        setIndex(next);
      };
      if (preload.complete && preload.naturalWidth) show();
      else {
        onLoad = show;
        preload.addEventListener('load', show, { once: true });
      }
    }, 6000);
    preload.addEventListener('error', onError, { once: true });
    preload.src = images[next];
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (onLoad) preload.removeEventListener('load', onLoad);
      preload.removeEventListener('error', onError);
    };
  }, [index, active]);

  return { active, layers };
}
