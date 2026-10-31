import { useEffect, useState } from 'react';
import useBackgroundSlideshow from '../hooks/useBackgroundSlideshow.js';
import { assetUrl } from '../utils/assetUrl.js';
import useLanguage from '../hooks/useLanguage.js';

const aboutImages = Array.from({ length: 17 }, (_, index) => index)
  .filter((index) => ![0, 9, 11, 16].includes(index))
  .map((index) => `images/${String(index).padStart(2, '0')}.webp`);

export default function About() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
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

    <section className="about-subscribe" aria-labelledby="subscribe-title">
      <div>
        <p className="section-label">{t('about.stay')}</p>
        <h2 id="subscribe-title">{t('about.subscribeTitle')}</h2>
        <p className="section-label">{t('about.subscribeText')}</p>
      </div>
      <form className="subscribe-form" onSubmit={(event) => event.preventDefault()}>
        <label className="visually-hidden" htmlFor="subscribe-email">{t('about.email')}</label>
        <input id="subscribe-email" type="email" placeholder={t('about.email')}
          autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button type="button"><span>{t('about.subscribe')}</span> <span aria-hidden="true">→</span></button>
      </form>
    </section>
  </main>;
}
