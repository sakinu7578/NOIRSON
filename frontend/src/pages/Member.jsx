import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import mixes from '../data/mixData.js';
import memberMock from '../data/memberMock.js';
import useLanguage from '../hooks/useLanguage.js';
import useBackgroundSlideshow from '../hooks/useBackgroundSlideshow.js';
import { assetUrl } from '../utils/assetUrl.js';

const memberImages = Array.from({ length: 17 }, (_, index) => index)
  .filter((index) => ![0, 9, 11, 16].includes(index))
  .map((index) => `images/${String(index).padStart(2, '0')}.webp`);

function MixRow({ id, action }) {
  const mix = mixes[id];
  if (!mix) return null;
  return <article className="member-mix-row">
    <Link className="member-mix-link" to={`/music/${id}`}>
      <img src={assetUrl(mix.cover)} alt="" loading="lazy" />
      <span className="member-mix-copy"><small>{id} / {mix.series}</small><strong>{mix.title}</strong></span>
      <span className="member-arrow" aria-hidden="true">↗</span>
    </Link>
    {action}
  </article>;
}

export default function Member() {
  const { language, t } = useLanguage();
  const [nickname, setNickname] = useState(memberMock.nickname);
  const [draft, setDraft] = useState(memberMock.nickname);
  const [favorites, setFavorites] = useState(memberMock.favorites);
  const [notice, setNotice] = useState('');
  const [activeView, setActiveView] = useState('favorites');
  const [passwordDraft, setPasswordDraft] = useState({ old: '', next: '', confirm: '' });
  const background = useBackgroundSlideshow({ images: memberImages, interval: 6000 });

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${t('member.title')} | NOIRSON`;
    return () => { document.title = previousTitle; };
  }, [t]);

  function saveNickname(event) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    setNickname(value);
    setDraft(value);
    setNotice(t('member.saved'));
  }

  function changeView(view) {
    if (activeView === view) return;
    const hasUnsavedInput = activeView === 'edit' && (
      draft !== nickname || Object.values(passwordDraft).some(Boolean)
    );
    if (hasUnsavedInput && !window.confirm(t('member.unsavedConfirm'))) return;
    if (activeView === 'edit') {
      setDraft(nickname);
      setPasswordDraft({ old: '', next: '', confirm: '' });
      setNotice('');
    }
    setActiveView(view);
  }

  return <main className="member-page">
    <div className="member-background" aria-hidden="true">
      {background.layers.map((image, layer) => <div key={layer}
        className={`member-background-layer ${layer === background.activeLayer ? 'is-active' : ''}`}
        style={{ backgroundImage: `url("${image}")` }} />)}
      <div className="member-background-overlay" />
    </div>
    <div className="member-shell">
      <section className="member-section member-profile" aria-labelledby="member-profile-title">
        <div className="member-profile-content">
          <div className="member-avatar" role="img" aria-label={t('member.avatar')}><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="23" r="10" stroke="currentColor" strokeWidth="2"/><path d="M13 55c0-11 8-18 19-18s19 7 19 18" stroke="currentColor" strokeWidth="2"/></svg></div>
          <div className="member-identity"><h1 id="member-profile-title">{nickname}</h1><span>{memberMock.email}</span><small>{t('member.demo')}</small></div>
        </div>
        <button className="member-edit-entry" type="button" onClick={() => setActiveView('edit')}>{t('member.editProfile')} <span aria-hidden="true">↗</span></button>
      </section>

      <section className="member-content" aria-label={t('member.content')}>
        <nav className="member-tabs" aria-label={t('member.content')}>
          {['favorites', 'comments', 'recent'].map((view) => <button key={view} type="button"
            className={activeView === view ? 'is-active' : ''} aria-pressed={activeView === view}
            onClick={() => changeView(view)}>{t(`member.${view}`)}</button>)}
        </nav>
        <div className="member-content-scroll" key={activeView}>
        {activeView === 'edit' && <>
          <div className="member-settings">
        <section className="member-section" aria-labelledby="member-edit-title">
          <div className="member-section-heading"><h2 id="member-edit-title">{t('member.edit')}</h2></div>
          <form className="member-form" onSubmit={saveNickname}>
            <label htmlFor="member-nickname">{t('member.nickname')}</label>
            <input id="member-nickname" value={draft} maxLength="40" required onChange={(event) => setDraft(event.target.value)} />
            <button type="submit">{t('member.save')}</button>
            <p className="member-form-note" role="status">{notice || t('member.localOnly')}</p>
          </form>
        </section>
        <section className="member-section" aria-labelledby="member-password-title">
          <div className="member-section-heading"><h2 id="member-password-title">{t('member.password')}</h2></div>
          <div className="member-form">
            <label htmlFor="member-old-password">{t('member.oldPassword')}</label><input id="member-old-password" type="password" autoComplete="current-password" value={passwordDraft.old} onChange={(event) => setPasswordDraft((current) => ({ ...current, old: event.target.value }))} />
            <label htmlFor="member-new-password">{t('member.newPassword')}</label><input id="member-new-password" type="password" autoComplete="new-password" value={passwordDraft.next} onChange={(event) => setPasswordDraft((current) => ({ ...current, next: event.target.value }))} />
            <label htmlFor="member-confirm-password">{t('member.confirmPassword')}</label><input id="member-confirm-password" type="password" autoComplete="new-password" value={passwordDraft.confirm} onChange={(event) => setPasswordDraft((current) => ({ ...current, confirm: event.target.value }))} />
            <button type="button" disabled>{t('member.changePassword')}</button>
            <p className="member-form-note">{t('member.comingSoon')}</p>
          </div>
        </section>
      </div>
          <div className="member-logout"><button type="button" disabled>{t('member.logout')}</button><p className="member-form-note">{t('member.comingSoon')}</p></div>
      </>}

      {activeView === 'favorites' && <section className="member-section" aria-labelledby="member-favorites-title">
        <h2 className="visually-hidden" id="member-favorites-title">{t('member.favorites')}</h2>
        <div className="member-list">{favorites.length ? favorites.map((id) => <MixRow key={id} id={id} action={<button className="member-remove" type="button" onClick={() => setFavorites((current) => current.filter((item) => item !== id))} aria-label={`${t('member.remove')} ${mixes[id]?.title ?? id}`}>{t('member.remove')}</button>} />) : <p className="member-empty">{t('member.empty')}</p>}</div>
      </section>}

      {activeView === 'comments' && <section className="member-section" aria-labelledby="member-comments-title">
        <h2 className="visually-hidden" id="member-comments-title">{t('member.comments')}</h2>
        <div className="member-list">{memberMock.comments.map((comment) => <article className="member-comment" key={comment.id}>
          <Link to={`/music/${comment.mixId}`}><small>{comment.mixId} / {mixes[comment.mixId]?.title}</small><span aria-hidden="true">↗</span></Link>
          <p>{language === 'en' ? comment.textEn : comment.textZh}</p><time dateTime={comment.date}>{comment.date}</time>
        </article>)}</div>
      </section>}

      {activeView === 'recent' && <section className="member-section" aria-labelledby="member-recent-title">
        <h2 className="visually-hidden" id="member-recent-title">{t('member.recent')}</h2>
        <div className="member-list">{memberMock.recentPlays.map((id) => <MixRow key={id} id={id} />)}</div>
      </section>}

        </div>
      </section>
    </div>
  </main>;
}
