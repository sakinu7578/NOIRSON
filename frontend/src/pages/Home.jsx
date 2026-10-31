import ExploreSound from '../components/ExploreSound.jsx';
import useAudioSpectrum from './useAudioSpectrum.js';
import useMusicPlayer from '../hooks/useMusicPlayer.js';
import useHomeStage from './useHomeStage.js';
import useHeroBackground from './useHeroBackground.js';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import useLanguage from '../hooks/useLanguage.js';

function Home() {
    const { t } = useLanguage();
    const visualizerRef = useRef(null);
    const { audioRef, isPlaying } = useMusicPlayer();
    useAudioSpectrum(audioRef, visualizerRef, isPlaying);
    const { stage, markersRef } = useHomeStage();
    const { active, layers } = useHeroBackground();
    useEffect(() => {
        document.body.dataset.homeStage = String(stage);
        const footer = document.querySelector('.site-footer--v2');
        if (footer) {
            footer.inert = stage !== 3;
            footer.setAttribute('aria-hidden', String(stage !== 3));
        }
    }, [stage]);
    return (
        <main data-home-stage={stage}>
            <section className="signature-mix" aria-labelledby="signature-title">
                <div className="signature-visual">
                    <img
                        id="signature-cover"
                        className={`signature-background ${active === 0 ? 'is-active' : ''}`}
                        src={layers[0]}
                        style={{ zIndex: active === 0 ? 1 : 0 }}
                        alt="Somewhere far from everyone 音樂封面"
                    />

                    <img
                        className={`signature-background ${active === 1 ? 'is-active' : ''}`}
                        src={layers[1]}
                        style={{ zIndex: active === 1 ? 1 : 0 }}
                        alt=""
                        aria-hidden="true"
                    />

                    <div
                        className="signature-visual-shade"
                        aria-hidden="true"
                    />

                    <div className="signature-content" inert={stage !== 1} aria-hidden={stage !== 1}>
                        <p className="signature-kicker">
                            {t('home.kicker')}
                        </p>

                        <div className="signature-heading">
                            <h1 id="signature-title">
                                {t('home.title')}
                            </h1>

                            <p className="signature-description">
                                {t('home.description1')}
                                <br />
                                {t('home.description2')}
                            </p>
                        </div>
                    </div>

                    <div className="listening-atmosphere" aria-hidden={stage !== 3}>
                        <Link className="listening-about-link" to="/about">
                            <span>{t('home.discover')}</span>
                            <span aria-hidden="true">↗</span>
                        </Link>

                        <p>{t('home.stay')}</p>

                        <canvas
                            ref={visualizerRef}
                            className="signature-visualizer"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </section>
            {/* MIX卡片元件 */}
            <ExploreSound stage={stage} />
            <div className="home-scroll-stages" aria-hidden="true" ref={markersRef}>
                {[1, 2, 3].map((number) => <div className="home-scroll-stage" data-home-stage={number} key={number} />)}
            </div>
        </main>
    );
}

export default Home;
