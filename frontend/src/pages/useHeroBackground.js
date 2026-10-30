import { useEffect, useState } from 'react';
import { assetUrl } from '../utils/assetUrl.js';

const images = ['00', '01', '05', '04', '13', '14'].map((name) => assetUrl(`images/${name}.png`));

export default function useHeroBackground() {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [layers, setLayers] = useState([images[0], images[0]]);

  useEffect(() => {
    const preloads = images.map((src) => { const image = new Image(); image.src = src; return image; });
    let cancelled = false;
    const timer = setTimeout(() => {
      const next = (index + 1) % images.length;
      const show = () => {
        if (cancelled) return;
        const nextLayer = 1 - active;
        setLayers((previous) => previous.map((src, layer) => layer === nextLayer ? images[next] : src));
        setActive(nextLayer);
        setIndex(next);
      };
      if (preloads[next].complete && preloads[next].naturalWidth) show();
      else {
        preloads[next].addEventListener('load', show, { once: true });
        preloads[next].addEventListener('error', () => { if (!cancelled) setIndex(next); }, { once: true });
      }
    }, 6000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [index, active]);

  return { active, layers };
}
