import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import mixes from '../data/mixData.js';
import { assetUrl } from '../utils/assetUrl.js';
import useLanguage from '../hooks/useLanguage.js';

const mixEntries = Object.entries(mixes);
const genres = [
  ['Chill / Lofi / Jazz', 'CHILL / LOFI / JAZZ'],
  ['Ethereal Trap / Cloud Trap', 'ETHEREAL TRAP / CLOUD TRAP'],
  ['Midnight Jersey', 'MIDNIGHT JERSEY'],
  ['City Pop', 'CITY POP'],
];

function cardsPerStage() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function entriesForGenre(genre) {
  return genre === 'all' ? mixEntries : mixEntries.filter(([, mix]) => mix.series === genre);
}

function makeStages(entries, count) {
  const stages = [];
  for (let index = 0; index < entries.length; index += count) {
    stages.push(entries.slice(index, index + count));
  }
  return stages.length ? stages : [[]];
}

export default function Explore() {
  const { language, t } = useLanguage();
  const english = language === 'en';
  const shellRef = useRef(null);
  const galleryRef = useRef(null);
  const switchingRef = useRef(false);
  const timersRef = useRef([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [view, setView] = useState(() => ({
    genre: 'all', perStage: cardsPerStage(), stage: 0, direction: 'next', version: 0,
  }));
  const [phase, setPhase] = useState('entering');
  const stages = useMemo(() => makeStages(entriesForGenre(view.genre), view.perStage), [view.genre, view.perStage]);
  const visibleEntries = useMemo(() => stages[view.stage] ?? [], [stages, view.stage]);

  const clearTransitionTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const queueTimer = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    timersRef.current.push(timer);
  };

  const switchStage = useCallback((direction) => {
    if (switchingRef.current || stages.length <= 1) return false;
    switchingRef.current = true;
    setPhase(direction > 0 ? 'leaving-next' : 'leaving-previous');
    queueTimer(() => {
      setView((current) => ({
        ...current,
        stage: (current.stage + direction + stages.length) % stages.length,
        direction: direction > 0 ? 'next' : 'previous',
        version: current.version + 1,
      }));
      setPhase('entering');
    }, 220);
    queueTimer(() => { switchingRef.current = false; }, 900);
    return true;
  }, [stages.length]);

  function selectGenre(genre) {
    if (switchingRef.current || genre === selectedGenre) return;
    switchingRef.current = true;
    setSelectedGenre(genre);
    setPhase('leaving-next');
    queueTimer(() => {
      setView((current) => ({ ...current, genre, stage: 0, direction: 'next', version: current.version + 1 }));
      setPhase('entering');
    }, 220);
    queueTimer(() => { switchingRef.current = false; }, 900);
  }

  // Wait for the new covers before running the original two-frame entrance transition.
  useEffect(() => {
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let settleTimer;
    const images = [...galleryRef.current.querySelectorAll('img')];
    const ready = images.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    }));
    Promise.all(ready).then(() => {
      if (cancelled) return;
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (cancelled) return;
          setPhase('visible');
          settleTimer = setTimeout(() => { if (!cancelled) setPhase('settled'); }, 760);
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(settleTimer);
    };
  }, [view.version]);

  useEffect(() => {
    const shell = shellRef.current;
    let wheelDelta = 0;
    let wheelResetTimer;
    let touchStartY = null;
    const onWheel = (event) => {
      if (event.ctrlKey) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (Math.abs(delta) < 1) return;
      if (switchingRef.current) { event.preventDefault(); return; }
      if (stages.length <= 1) return;
      event.preventDefault();
      const direction = delta > 0 ? 1 : -1;
      if (wheelDelta && Math.sign(wheelDelta) !== direction) wheelDelta = 0;
      wheelDelta += delta;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => { wheelDelta = 0; }, 120);
      if (Math.abs(wheelDelta) < 24) return;
      wheelDelta = 0;
      switchStage(direction);
    };
    const onTouchStart = (event) => { touchStartY = event.touches[0]?.clientY ?? null; };
    const onTouchEnd = (event) => {
      if (touchStartY === null || !event.changedTouches.length) return;
      const distance = event.changedTouches[0].clientY - touchStartY;
      touchStartY = null;
      if (Math.abs(distance) >= 50) switchStage(distance < 0 ? 1 : -1);
    };
    const onTouchCancel = () => { touchStartY = null; };
    shell.addEventListener('wheel', onWheel, { passive: false });
    shell.addEventListener('touchstart', onTouchStart, { passive: true });
    shell.addEventListener('touchend', onTouchEnd, { passive: true });
    shell.addEventListener('touchcancel', onTouchCancel, { passive: true });
    return () => {
      shell.removeEventListener('wheel', onWheel);
      shell.removeEventListener('touchstart', onTouchStart);
      shell.removeEventListener('touchend', onTouchEnd);
      shell.removeEventListener('touchcancel', onTouchCancel);
      clearTimeout(wheelResetTimer);
    };
  }, [stages.length, switchStage]);

  useEffect(() => {
    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const nextCount = cardsPerStage();
        if (nextCount === view.perStage) return;
        const firstId = visibleEntries[0]?.[0] ?? entriesForGenre(view.genre)[0]?.[0];
        const nextStages = makeStages(entriesForGenre(view.genre), nextCount);
        const nextStage = Math.max(0, nextStages.findIndex((group) => group.some(([id]) => id === firstId)));
        clearTransitionTimers();
        switchingRef.current = false;
        setSelectedGenre(view.genre);
        setView((current) => ({ ...current, perStage: nextCount, stage: nextStage, direction: 'next', version: current.version + 1 }));
        setPhase('entering');
      });
    };
    addEventListener('resize', onResize);
    return () => { removeEventListener('resize', onResize); cancelAnimationFrame(resizeFrame); };
  }, [view, visibleEntries, clearTransitionTimers]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Explore Music | NOIRSON';
    return () => { document.title = previousTitle; clearTransitionTimers(); };
  }, [clearTransitionTimers]);

  const entering = phase === 'entering' || phase === 'visible';
  const leaving = phase.startsWith('leaving-');
  const cardClass = entering ? `is-entering-${view.direction}${phase === 'visible' ? ' is-stage-visible' : ''}` : leaving ? `is-${phase}` : '';

  return <main className="explore-page">
    <section className="explore-intro" aria-labelledby="explore-title">
      <p className="section-label">{t('explore.collection')}</p>
      <h1 id="explore-title">{t('explore.title')}</h1>
      <p className="explore-description">{t('explore.description')}</p>
    </section>

    <section className="explore-catalog" aria-labelledby="catalog-title">
      <div className="explore-catalog-heading">
        <button id="catalog-title" className={`explore-filter ${selectedGenre === 'all' ? 'is-active' : ''}`}
          type="button" aria-pressed={selectedGenre === 'all'} onClick={() => selectGenre('all')}>{t('explore.all')}</button>
        <nav className="explore-genres" aria-label={english ? 'Mix genre categories' : 'Mix 曲風分類'}
          onWheel={(event) => {
            const genres = event.currentTarget;
            if (genres.scrollWidth <= genres.clientWidth) return;
            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            if (!delta) return;
            genres.scrollLeft += delta;
            event.preventDefault();
            event.stopPropagation();
          }}>
          <span className="explore-genres-label">{t('explore.genre')}</span>
          {genres.map(([genre, label]) => <button key={genre}
            className={`explore-filter ${selectedGenre === genre ? 'is-active' : ''}`}
            type="button" aria-pressed={selectedGenre === genre} onClick={() => selectGenre(genre)}>{label}</button>)}
        </nav>
      </div>
      <div className="explore-catalog-divider" aria-hidden="true" />
      <div className="explore-stage-shell" ref={shellRef}>
        <div className="explore-gallery" data-count={visibleEntries.length} aria-live="polite" ref={galleryRef}>
          {visibleEntries.length ? visibleEntries.map(([id, mix], index) => <article key={id}
            className={`explore-gallery-item ${cardClass}`} style={{ '--stage-delay': leaving ? '0ms' : `${index * 60}ms` }}>
            <Link to={`/music/${id}`} aria-label={english ? `View details for ${mix.title}` : `前往 ${mix.title} 詳細頁`}>
              <span className="explore-gallery-cover">
                <img src={assetUrl(mix.cover)} alt={english ? `${mix.title} cover` : `${mix.title} 音樂封面`} />
                <span className="explore-gallery-id">{id}</span>
              </span>
              <span className="explore-gallery-copy"><strong>{mix.title}</strong><small>{mix.series}</small></span>
            </Link>
          </article>) : <p className="explore-no-results">No Mixes Found</p>}
        </div>
        <p className="explore-stage-progress" aria-live="polite" hidden={!visibleEntries.length}>
          <span className="explore-stage-current">{String(view.stage + 1).padStart(2, '0')}</span> / <span className="explore-stage-total">{String(stages.length).padStart(2, '0')}</span>
        </p>
      </div>
    </section>
  </main>;
}
