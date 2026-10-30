
import { useEffect, useRef, useState } from 'react';
import mixes from '../data/mixData.js';
import { Link } from 'react-router';
import { assetUrl } from '../utils/assetUrl.js';
import useLanguage from '../hooks/useLanguage.js';

const ids = Object.keys(mixes);
const carouselIds = [...ids, ...ids, ...ids];

function ExploreSound({ stage }) {
    const { language, t } = useLanguage();
    const english = language === 'en';
    const viewportRef = useRef(null);
    const trackRef = useRef(null);
    const indexRef = useRef(ids.length + 2);
    const switchingRef = useRef(false);
    const dragRef = useRef(null);
    const suppressClickRef = useRef(false);
    const [index, setIndex] = useState(ids.length + 2);
    const [offset, setOffset] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [instant, setInstant] = useState(true);
    const [metrics, setMetrics] = useState({ center: 0, step: 0 });

    useEffect(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        const measure = () => {
            const card = track.querySelector('.explore-card');
            if (!card) return;
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            setMetrics({ center: viewport.clientWidth / 2 - card.offsetWidth / 2, step: card.offsetWidth + gap });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(viewport);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (instant) {
            const frame = requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)));
            return () => cancelAnimationFrame(frame);
        }
    }, [instant]);

    function moveCarousel(direction) {
        if (switchingRef.current || dragRef.current) return;
        switchingRef.current = true;
        indexRef.current += direction;
        setIndex(indexRef.current);
    }

    function endDrag(event) {
        const drag = dragRef.current;
        if (!drag) return;
        dragRef.current = null;
        setDragging(false);
        setOffset(0);
        const moved = Math.round(-drag.offset / metrics.step);
        if (moved) {
            switchingRef.current = true;
            indexRef.current += moved;
            setIndex(indexRef.current);
        }
        if (viewportRef.current.hasPointerCapture(event.pointerId)) viewportRef.current.releasePointerCapture(event.pointerId);
    }

    return (
        <section className="explore-sound" aria-labelledby="explore-sound-title" inert={stage !== 2} aria-hidden={stage !== 2}>
            <div className="explore-sound-header">
                <h2 id="explore-sound-title">{t('home.explore')}</h2>

                <Link className="explore-all-link" to="/music">
                    <span>{t('home.viewAll')}</span>
                    <span aria-hidden="true">→</span>
                </Link>
            </div>

            <div className="explore-carousel" aria-label={t('a11y.carousel')}>
                <button
                    className="explore-arrow explore-arrow--previous"
                    type="button"
                    aria-label={t('a11y.previous')}
                    onClick={() => moveCarousel(-1)}
                >
                    <span aria-hidden="true">←</span>
                </button>

                <div className={`explore-viewport ${dragging ? 'is-grabbing' : ''}`} ref={viewportRef}
                    onPointerDown={(event) => { if (!switchingRef.current && metrics.step) { dragRef.current = { start: event.clientX, offset: 0 }; setDragging(true); } }}
                    onPointerMove={(event) => {
                        const drag = dragRef.current;
                        if (!drag) return;
                        drag.offset = Math.max(-metrics.step * (ids.length - 1), Math.min(metrics.step * (ids.length - 1), event.clientX - drag.start));
                        if (Math.abs(drag.offset) > 5 && !viewportRef.current.hasPointerCapture(event.pointerId)) {
                            viewportRef.current.setPointerCapture(event.pointerId);
                            suppressClickRef.current = true;
                        }
                        setOffset(drag.offset);
                    }}
                    onPointerUp={endDrag} onPointerCancel={endDrag}
                    onClickCapture={(event) => { if (suppressClickRef.current && event.detail !== 0) { event.preventDefault(); suppressClickRef.current = false; } }}
                    onDragStart={(event) => event.preventDefault()}>
                    <div className={`explore-track ${dragging ? 'is-dragging' : ''}`} ref={trackRef}
                        style={{ transform: `translate3d(${metrics.center - index * metrics.step + offset}px, 0, 0)`, transition: instant ? 'none' : undefined }}
                        onTransitionEnd={(event) => {
                            if (event.target !== trackRef.current || event.propertyName !== 'transform' || !switchingRef.current) return;
                            const normalized = ((indexRef.current % ids.length) + ids.length) % ids.length + ids.length;
                            if (normalized !== indexRef.current) { indexRef.current = normalized; setInstant(true); setIndex(normalized); }
                            switchingRef.current = false;
                        }}>
                        {/* // 每筆音樂資料產生一張卡片 */}
                        {carouselIds.map((mixId, position) => {
                            const mix = mixes[mixId];
                            return (
                            <Link
                                className={`explore-card ${Math.abs(position - index) === 2 ? 'is-edge' : ''}`}
                                key={`${mixId}-${position}`}
                                to={`/music/${mixId}`}
                                aria-label={english ? `View details for ${mix.title}` : `前往 ${mix.title} 詳細頁`}
                            >
                                <span
                                    className="explore-card-image"
                                    style={{
                                        backgroundImage: `url('${assetUrl(mix.cover)}')`
                                    }}
                                >
                                    <img
                                        src={assetUrl(mix.cover)}
                                        alt={english ? `${mix.title} cover` : `${mix.title} 音樂封面`}
                                        draggable="false"
                                        onLoad={(event) => {
                                            const image = event.currentTarget;
                                            const cover = image.parentElement;
                                            cover.classList.toggle('is-cover-by-height', image.naturalWidth / image.naturalHeight >= 4 / 3);
                                            cover.classList.toggle('is-cover-by-width', image.naturalWidth / image.naturalHeight < 4 / 3);
                                        }}
                                    />

                                    <span className="explore-card-copy">
                                        <strong>{mix.title}</strong>
                                        <small>{mix.series}</small>
                                    </span>
                                </span>
                            </Link>
                        ); })}
                    </div>
                </div>

                <button
                    className="explore-arrow explore-arrow--next"
                    type="button"
                    aria-label={t('a11y.next')}
                    onClick={() => moveCarousel(1)}
                >
                    <span aria-hidden="true">→</span>
                </button>
            </div>
        </section>
    );
}

export default ExploreSound;
