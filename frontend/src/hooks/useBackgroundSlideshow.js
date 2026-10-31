import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../utils/assetUrl.js';

function randomIndex(length, excluded = -1) {
  if (length <= 1) return 0;
  let next;
  do { next = Math.floor(Math.random() * length); } while (next === excluded);
  return next;
}

export default function useBackgroundSlideshow({
  images,
  interval,
  fadeDuration = 0,
  overlap = false,
  respectReducedMotion = false,
}) {
  const [state, setState] = useState(() => {
    const index = randomIndex(images.length);
    const path = assetUrl(images[index]);
    return { index, layers: [path, path], activeLayer: 0, fadingFrom: null };
  });
  const stateRef = useRef(state);

  useEffect(() => {
    const reducedMotion = respectReducedMotion
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || images.length < 2) return;

    let cancelled = false;
    let slideshowTimer;
    let fadeTimer;
    let requestId = 0;
    let pendingImage;
    let pendingLoad;
    let pendingError;

    function clearPending() {
      if (pendingImage) {
        pendingImage.removeEventListener('load', pendingLoad);
        pendingImage.removeEventListener('error', pendingError);
        pendingImage = null;
      }
    }

    function schedule() {
      clearTimeout(slideshowTimer);
      slideshowTimer = setTimeout(advance, interval);
    }

    function advance() {
      const current = stateRef.current;
      const nextIndex = randomIndex(images.length, current.index);
      const requestedImage = new Image();
      const currentRequest = ++requestId;

      function show() {
        if (cancelled || currentRequest !== requestId) return;
        clearPending();
        const latest = stateRef.current;
        const nextLayer = latest.activeLayer === 0 ? 1 : 0;
        const nextState = {
          index: nextIndex,
          layers: latest.layers.map((path, layer) => (
            layer === nextLayer ? assetUrl(images[nextIndex]) : path
          )),
          activeLayer: nextLayer,
          fadingFrom: overlap ? latest.activeLayer : null,
        };
        stateRef.current = nextState;
        setState(nextState);
        schedule();

        if (overlap) {
          clearTimeout(fadeTimer);
          fadeTimer = setTimeout(() => {
            if (cancelled) return;
            const settled = { ...stateRef.current, fadingFrom: null };
            stateRef.current = settled;
            setState(settled);
          }, fadeDuration);
        }
      }

      function onError() {
        if (cancelled || currentRequest !== requestId) return;
        clearPending();
        schedule();
      }

      pendingImage = requestedImage;
      pendingLoad = show;
      pendingError = onError;
      requestedImage.addEventListener('load', show, { once: true });
      requestedImage.addEventListener('error', onError, { once: true });
      requestedImage.src = assetUrl(images[nextIndex]);
      if (requestedImage.complete && requestedImage.naturalWidth > 0) show();
    }

    schedule();
    return () => {
      cancelled = true;
      requestId += 1;
      clearTimeout(slideshowTimer);
      clearTimeout(fadeTimer);
      clearPending();
    };
  }, [fadeDuration, images, interval, overlap, respectReducedMotion]);

  return state;
}
