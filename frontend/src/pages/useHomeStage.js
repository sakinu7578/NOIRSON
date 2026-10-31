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
      if (wrapping || frame) return;
      frame = requestAnimationFrame(() => { frame = 0; if (!wrapping) update(); });
    };
    const beginCooldown = (direction) => {
      clearTimeout(cooldownTimer);
      cooldownDirection = direction;
      cooldown = true;
      cooldownTimer = setTimeout(() => { cooldown = false; }, 180);
    };
    const goTo = (next, direction) => {
      const start = scrollY;
      const target = markersRef.current.children[next - 1].offsetTop;
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 760;
      const startTime = performance.now();
      animating = true;
      wrapping = Math.abs(next - stageRef.current) > 1;
      if (wrapping) set(next);
      const tick = (time) => {
        const progress = duration ? Math.min(1, (time - startTime) / duration) : 1;
        scrollTo(0, start + (target - start) * (1 - (1 - progress) ** 3));
        if (progress < 1) animationFrame = requestAnimationFrame(tick);
        else {
          set(next);
          animating = false;
          wrapping = false;
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
      if (finePointer.matches || event.touches.length !== 1) return;
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY, target: event.target };
    };
    const onTouchEnd = (event) => {
      if (!touchStart || !event.changedTouches.length || animating) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      const control = touchStart.target.closest('a, button, input, textarea, select, [data-home-playlist-scroll]');
      touchStart = null;
      if (control || Math.abs(dy) < 60 || Math.abs(dy) <= Math.abs(dx)) return;
      if (stageRef.current === 3 && dy < 0) goTo(1, 1);
      if (stageRef.current === 1 && dy > 0) goTo(3, -1);
    };
    const onTouchCancel = () => { touchStart = null; };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchend', onTouchEnd, { passive: true });
    addEventListener('touchcancel', onTouchCancel, { passive: true });
    return () => {
      document.documentElement.classList.remove('home-scenes');
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      removeEventListener('wheel', onWheel);
      removeEventListener('touchstart', onTouchStart);
      removeEventListener('touchend', onTouchEnd);
      removeEventListener('touchcancel', onTouchCancel);
      clearTimeout(cooldownTimer);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(animationFrame);
    };
  }, []);
  return { stage, markersRef };
}
