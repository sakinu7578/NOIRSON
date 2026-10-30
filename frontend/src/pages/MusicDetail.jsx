import { useEffect } from 'react';
import { useParams } from 'react-router';
import DetailGallery from '../components/DetailGallery.jsx';
import DetailPlayer from '../components/DetailPlayer.jsx';
import mixes from '../data/mixData.js';
import useLanguage from '../hooks/useLanguage.js';

function DetailPage({ mixId, mix }) {
  const { language, t } = useLanguage();
  const english = language === 'en';
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${mix.title} | NOIRSON`;
    return () => { document.title = previousTitle; };
  }, [mix.title]);

  return <main className="music-detail-page">
    <section className="music-detail-hero" aria-labelledby="music-detail-title">
      <DetailGallery mix={mix} english={english} />
      <div className="music-detail-info">
        <p className="music-detail-eyebrow"><span>{mixId}</span><span>{mix.series}</span></p>
        <h1 id="music-detail-title">{mix.title}</h1>
        <DetailPlayer mixId={mixId} mix={mix} english={english} />
        <p className="music-detail-description">{(english ? mix.description : mix.descriptionZh).trim()}</p>
        <button className="detail-favorite" type="button">{t('detail.favorite')}</button>
        <section className="detail-comments" aria-labelledby="detail-comments-title">
          <h2 id="detail-comments-title">{t('detail.comments')}</h2>
          <label className="visually-hidden" htmlFor="detail-comment">{english ? 'Leave a comment' : '留下留言'}</label>
          <textarea id="detail-comment" rows="3" placeholder={t('detail.comment')} disabled />
        </section>
        {mix.youtube && <div className="detail-youtube-row">
          <a className="detail-youtube" href={mix.youtube} target="_blank" rel="noreferrer">
            <span>{t('detail.youtube')}</span> <span aria-hidden="true">↗</span>
          </a>
        </div>}
      </div>
    </section>
  </main>;
}

export default function MusicDetail() {
  const { id } = useParams();
  const mixId = Object.hasOwn(mixes, id) ? id : 'M001';
  return <DetailPage key={mixId} mixId={mixId} mix={mixes[mixId]} />;
}
