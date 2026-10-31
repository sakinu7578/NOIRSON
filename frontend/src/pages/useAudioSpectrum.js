import { useEffect } from 'react';

const graphs = new WeakMap();

export function releaseAudioSpectrum(audio) {
  const graph = graphs.get(audio);
  if (!graph) return;
  graph.source.disconnect();
  graph.analyser.disconnect();
  graph.context.close().catch(() => {});
  graphs.delete(audio);
}

export default function useAudioSpectrum(audioRef, canvasRef, isPlaying) {
  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const context2d = canvas?.getContext('2d');
    if (!audio || !canvas || !context2d) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let width = 1;
    let height = 1;
    let heights = [];
    let disposed = false;

    function draw(forceStatic = false) {
      const graph = graphs.get(audio);
      const analyser = graph?.analyser;
      const frequency = graph?.frequency;
      const barCount = Math.min(512, Math.max(64, Math.round(width / 12)));
      const barWidth = width / barCount;
      const active = analyser && !audio.paused && !audio.muted && audio.volume > 0
        && !reducedMotion.matches && !forceStatic;
      if (heights.length !== barCount) heights = Array(barCount).fill(1);

      let average = 0;
      if (active) {
        analyser.getByteFrequencyData(frequency);
        const count = Math.max(1, Math.floor(frequency.length * 0.7));
        for (let i = 0; i < count; i += 1) average += frequency[i];
        average /= count * 255;
      }

      context2d.clearRect(0, 0, width, height);
      context2d.fillStyle = '#a39c8b';
      for (let i = 0; i < barCount; i += 1) {
        let target = 1;
        if (active) {
          const position = (i + 0.5) / barCount;
          const distance = Math.abs(position - 0.5) * 2;
          const frequencyPosition = Math.min(1,
            Math.pow(distance, position < 0.5 ? 1.18 : 1.12) + (position < 0.5 ? 0.012 : 0.024));
          const bin = Math.max(1, Math.min(frequency.length - 1,
            Math.floor(frequencyPosition * frequency.length * 0.7)));
          const strength = frequency[bin] / 255 * 0.64 + average * 0.36;
          target = 1 + strength * (height - 1) * (0.78 - distance * 0.18) * 0.72;
        }
        heights[i] += (target - heights[i]) * (target > heights[i] ? 0.24 : 0.08);
        context2d.fillRect(i * barWidth, height - Math.max(1, heights[i]),
          Math.ceil(barWidth), Math.max(1, heights[i]));
      }

      animationFrame = 0;
      const settling = heights.some((value) => value > 1.2);
      if ((active || settling) && !disposed) animationFrame = requestAnimationFrame(() => draw());
    }

    function start() {
      if (animationFrame) return;
      draw(reducedMotion.matches);
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context2d.setTransform(ratio, 0, 0, ratio, 0, 0);
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      heights = [];
      draw(true);
      if (!audio.paused) start();
    }

    const observer = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(canvas);
    else addEventListener('resize', resize);
    audio.addEventListener('play', start);
    audio.addEventListener('pause', start);
    audio.addEventListener('ended', start);
    audio.addEventListener('volumechange', start);
    reducedMotion.addEventListener('change', resize);
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer?.disconnect();
      if (!observer) removeEventListener('resize', resize);
      audio.removeEventListener('play', start);
      audio.removeEventListener('pause', start);
      audio.removeEventListener('ended', start);
      audio.removeEventListener('volumechange', start);
      reducedMotion.removeEventListener('change', resize);
      // Keep the source node while HOME unmounts; Provider releases it with the audio.
    };
  }, [audioRef, canvasRef, isPlaying]);

  function ensureSpectrum() {
    const audio = audioRef.current;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audio || !AudioContextClass || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      if (!graphs.has(audio)) {
        const context = new AudioContextClass();
        try {
          const analyser = context.createAnalyser();
          analyser.fftSize = 1024;
          analyser.smoothingTimeConstant = 0.88;
          const source = context.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(context.destination);
          graphs.set(audio, { context, source, analyser, frequency: new Uint8Array(analyser.frequencyBinCount) });
        } catch {
          context.close().catch(() => {});
          return;
        }
      }
      const graph = graphs.get(audio);
      if (graph.context.state === 'suspended') {
        graph.context.resume().catch(() => {});
      }
    } catch {
      // Playback remains available if Web Audio is unsupported or denied.
    }
  }

  return ensureSpectrum;
}
