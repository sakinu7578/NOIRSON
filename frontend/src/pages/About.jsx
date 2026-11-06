import { useEffect } from 'react';
import { Link } from 'react-router';
import mixes from '../data/mixData.js';
import useBackgroundSlideshow from '../hooks/useBackgroundSlideshow.js';
import { assetUrl } from '../utils/assetUrl.js';
import useLanguage from '../hooks/useLanguage.js';

const aboutImages = Array.from({ length: 17 }, (_, index) => index)
  .filter((index) => ![0, 9, 11, 16].includes(index))
  .map((index) => `images/${String(index).padStart(2, '0')}.webp`);
const mixEntries = Object.entries(mixes);

export default function About() {
  const { t } = useLanguage();
  const background = useBackgroundSlideshow({ images: aboutImages, interval: 6000 });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'About | NOIRSON';
    return () => { document.title = previousTitle; };
  }, []);

  return <main className="about-page">
    <div className="about-background" aria-hidden="true">
      {background.layers.map((image, layer) => <div key={layer}
        className={`about-background-layer ${layer === background.activeLayer ? 'is-active' : ''}`}
        style={{ backgroundImage: `url("${image}")` }} />)}
      <div className="about-background-overlay" />
    </div>

    <section className="about-world" aria-labelledby="about-page-title">
      <div className="about-world-copy">
        <p className="section-label">{t('about.label')}</p>
        <h1 id="about-page-title">{t('about.title')}</h1>
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
      </div>
    </section>

    <section className="about-sound" aria-labelledby="behind-sound-title">
      <div className="about-section-heading">
        <p className="section-label">{t('about.people')}</p>
        <h2 id="behind-sound-title">{t('about.behind')}</h2>
      </div>
      <div className="about-people">
        <article className="about-person">
          <div className="about-person-image"><img src={assetUrl('images/hunag.png')} alt="Hunag" /></div>
          <div className="about-person-copy"><h3>HUNAG</h3><p>{t('about.role1')}</p></div>
        </article>
        <article className="about-person">
          <div className="about-person-image"><img src={assetUrl('images/sloth.png')} alt="Sloth" /></div>
          <div className="about-person-copy"><h3>SLOTH</h3><p>{t('about.role2')}</p></div>
        </article>
      </div>
    </section>

    <section className="about-mixes" aria-labelledby="about-mixes-title">
      <h2 className="section-label" id="about-mixes-title">EXPLORE THE SOUND</h2>
      <div className="about-mixes-viewport">
        <div className="about-mixes-track">
          {/* 複製組只從鍵盤與輔助科技導覽隱藏，仍可用滑鼠點擊。 */}
          {[false, true].map((duplicate) =>
            <div className="about-mixes-group" key={String(duplicate)} aria-hidden={duplicate}>
              {mixEntries.map(([id, mix]) =>
                <Link className="about-mix-card" to={`/music/${id}`} key={id} tabIndex={duplicate ? -1 : undefined}>
                  <img src={assetUrl(mix.cover)} alt="" />
                  <span className="about-mix-copy"><strong>{mix.title}</strong><small>{mix.series}</small></span>
                </Link>)}
            </div>)}
        </div>
      </div>
    </section>
  </main>;
}
