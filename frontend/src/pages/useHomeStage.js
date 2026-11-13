import { useEffect, useRef, useState } from 'react';

export default function useHomeStage() {
  const [stage, setStage] = useState(1);
  const stageRef = useRef(1);
  const markersRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('home-scenes');
    let frame = 0;
    let animationFrame = 0;
    let animating = false;
    let wrapping = false;
    let touchAnimating = false;
    let cooldown = false;
    let cooldownDirection = 0;
    let cooldownTimer;
    const set = (value) => { stageRef.current = value; setStage(value); };
    const update = () => {
      const center = innerHeight / 2;
      const markers = [...markersRef.current.children];
      const nearest = markers.map((node, index) => {
        const rect = node.getBoundingClientRect();
        return { index: index + 1, distance: Math.abs(rect.top + rect.height / 2 - center) };
      }).sort((a, b) => a.distance - b.distance)[0];
      set(nearest.index);
    };
    const onScroll = () => {
      if (wrapping || touchAnimating || frame) return;
      frame = requestAnimationFrame(() => { frame = 0; if (!wrapping && !touchAnimating) update(); });
    };
    const beginCooldown = (direction) => {
      clearTimeout(cooldownTimer);
      cooldownDirection = direction;
      cooldown = true;
      cooldownTimer = setTimeout(() => { cooldown = false; }, 180);
    };
    const goTo = (next, direction, fromTouch = false) => {
      const start = scrollY;
      const target = markersRef.current.children[next - 1].offsetTop;
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 760;
      const startTime = performance.now();
      animating = true;
      touchAnimating = fromTouch;
      wrapping = Math.abs(next - stageRef.current) > 1;
      if (wrapping) set(next);
      const tick = (time) => {
        const progress = duration ? Math.min(1, (time - startTime) / duration) : 1;
        scrollTo(0, start + (target - start) * (1 - (1 - progress) ** 3));
        if (progress < 1) animationFrame = requestAnimationFrame(tick);
        else {
          // 以標記的實際位置收尾，避免動畫浮點誤差與 Safari 視窗高度變化留下偏移。
          scrollTo(0, markersRef.current.children[next - 1].offsetTop);
          set(next);
          animating = false;
          wrapping = false;
          touchAnimating = false;
          document.documentElement.classList.remove('home-touch-scrolling');
          beginCooldown(direction);
        }
      };
      animationFrame = requestAnimationFrame(tick);
    };
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const onWheel = (event) => {
      if (!finePointer.matches || event.ctrlKey || (event.target instanceof Element && event.target.closest('input[type="range"], [data-home-playlist-scroll]'))) return;
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (animating || Math.abs(delta) < 1) return;
      const direction = delta > 0 ? 1 : -1;
      if (cooldown) {
        if (direction === cooldownDirection) { beginCooldown(direction); return; }
        clearTimeout(cooldownTimer);
        cooldown = false;
      }
      goTo((stageRef.current - 1 + direction + 3) % 3 + 1, direction);
    };
    let touchStart = null;
    const onTouchStart = (event) => {
      touchStart = null;
      if (finePointer.matches || event.touches.length !== 1 || !(event.target instanceof Element)) return;
      if (event.target.closest('a, button, input, textarea, select, [data-home-playlist-scroll], .global-mini-player, .explore-viewport')) return;
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY, vertical: false, horizontal: false, blocked: animating };
    };
    const onTouchMove = (event) => {
      if (!touchStart || event.touches.length !== 1) {
        touchStart = null;
        if (!animating) document.documentElement.classList.remove('home-touch-scrolling');
        return;
      }
      const dx = event.touches[0].clientX - touchStart.x;
      const dy = event.touches[0].clientY - touchStart.y;
      if (!touchStart.vertical && !touchStart.horizontal && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
        touchStart.vertical = Math.abs(dy) > Math.abs(dx);
        touchStart.horizontal = !touchStart.vertical;
        if (touchStart.vertical) document.documentElement.classList.add('home-touch-scrolling');
      }
      // 只接管非互動區的垂直手勢；動畫中的新手勢也不能啟動原生捲動。
      if (touchStart.vertical && event.cancelable) event.preventDefault();
    };
    const onTouchEnd = (event) => {
      if (!touchStart || !event.changedTouches.length) return;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      const { vertical, blocked } = touchStart;
      touchStart = null;
      if (!vertical || blocked || animating || Math.abs(dy) < 60) {
        if (!animating) document.documentElement.classList.remove('home-touch-scrolling');
        return;
      }
      const direction = dy < 0 ? 1 : -1;
      goTo((stageRef.current - 1 + direction + 3) % 3 + 1, direction, true);
    };
    const onTouchCancel = () => {
      touchStart = null;
      if (!animating) document.documentElement.classList.remove('home-touch-scrolling');
    };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: false });
    addEventListener('touchend', onTouchEnd, { passive: true });
    addEventListener('touchcancel', onTouchCancel, { passive: true });
    return () => {
      document.documentElement.classList.remove('home-scenes');
      document.documentElement.classList.remove('home-touch-scrolling');
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      removeEventListener('wheel', onWheel);
      removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchmove', onTouchMove);
      removeEventListener('touchend', onTouchEnd);
      removeEventListener('touchcancel', onTouchCancel);
      clearTimeout(cooldownTimer);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(animationFrame);
    };
  }, []);
  return { stage, markersRef };
}
