import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import DetailGallery from '../components/DetailGallery.jsx';
import DetailPlayer from '../components/DetailPlayer.jsx';
import mixes from '../data/mixData.js';
import useLanguage from '../hooks/useLanguage.js';

const mixIds = Object.keys(mixes);

function DetailPage({ pageMixId, mix }) {
  const { language, t } = useLanguage();
  const english = language === 'en';
  const currentIndex = mixIds.indexOf(pageMixId);
  const previousId = mixIds[(currentIndex - 1 + mixIds.length) % mixIds.length];
  const nextId = mixIds[(currentIndex + 1) % mixIds.length];
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${mix.title} | NOIRSON`;
    return () => { document.title = previousTitle; };
  }, [mix.title]);

  return <main className="music-detail-page">
    <section className="music-detail-hero" aria-labelledby="music-detail-title">
      <DetailGallery mix={mix} english={english} />
      <div className="music-detail-info">
        <p className="music-detail-eyebrow"><span>{pageMixId}</span><span>{mix.series}</span></p>
        <div className="music-detail-title-row">
          <h1 id="music-detail-title">{mix.title}</h1>
          <DetailPlayer pageMixId={pageMixId} mix={mix} english={english} />
        </div>
        <nav className="music-detail-neighbors" aria-label={english ? 'Mix detail pages' : '歌曲介紹頁面導覽'}>
          <Link className="music-detail-neighbor" to={`/music/${previousId}`}>
            <span aria-hidden="true">←</span>
            <span><small>{english ? 'Previous song details' : '上一首歌曲介紹'}</small><strong>{previousId} · {mixes[previousId].title}</strong></span>
          </Link>
          <Link className="music-detail-neighbor music-detail-neighbor-next" to={`/music/${nextId}`}>
            <span><small>{english ? 'Next song details' : '下一首歌曲介紹'}</small><strong>{nextId} · {mixes[nextId].title}</strong></span>
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
        <p className="music-detail-description">{(english ? mix.description : mix.descriptionZh).trim()}</p>
        <div className="detail-actions">
          <button className="detail-favorite" type="button">{t('detail.favorite')}</button>
          {mix.youtube && <div className="detail-youtube-row">
            <a className="detail-youtube" href={mix.youtube} target="_blank" rel="noreferrer">
              <span>{t('detail.youtube')}</span> <span aria-hidden="true">↗</span>
            </a>
          </div>}
        </div>
        <section className="detail-comments" aria-labelledby="detail-comments-title">
          <div className="detail-comments-heading">
            <h2 id="detail-comments-title">{t('detail.comments')}</h2>
            <span className="detail-comments-count">0</span>
          </div>
          <label className="visually-hidden" htmlFor="detail-comment">{english ? 'Leave a comment' : '留下留言'}</label>
          <textarea id="detail-comment" rows="3" placeholder={t('detail.comment')} disabled />
          <button className="detail-comment-submit" type="button" disabled>{english ? 'Post comment' : '送出留言'}</button>
          <div className="detail-comment-list" aria-live="polite">
            <p className="detail-comments-empty">{english ? 'No comments yet.' : '尚無留言'}</p>
          </div>
        </section>
      </div>
    </section>
  </main>;
}

export default function MusicDetail() {
  const { id } = useParams();
  const pageMixId = Object.hasOwn(mixes, id) ? id : 'M001';
  return <DetailPage key={pageMixId} pageMixId={pageMixId} mix={mixes[pageMixId]} />;
}
