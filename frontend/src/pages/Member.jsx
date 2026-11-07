import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { FavoritesApiError, getFavorites, removeFavorite } from '../api/favorites.js';
import { getPlayHistory, PlayHistoryApiError } from '../api/playHistory.js';
import { CommentsApiError, getMyComments } from '../api/comments.js';
import mixes from '../data/mixData.js';
import useLanguage from '../hooks/useLanguage.js';
import useAuth from '../hooks/useAuth.js';
import useMusicPlayer from '../hooks/useMusicPlayer.js';
import useBackgroundSlideshow from '../hooks/useBackgroundSlideshow.js';
import { assetUrl } from '../utils/assetUrl.js';
import { formatCommentDate } from '../utils/formatCommentDate.js';

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

// 先等 Session 查詢完成，避免重整會員頁時誤判為未登入。
export default function Member() {
  const { currentUser, isAuthLoading, authError, refreshCurrentUser } = useAuth();
  const { t } = useLanguage();
  if (isAuthLoading) return <main className="member-page" aria-busy="true" />;
  if (authError) return <main className="member-page"><div className="member-shell">
    <p role="alert">{t('auth.checkFailed')} <button type="button" onClick={refreshCurrentUser}>{t('auth.retry')}</button></p>
  </div></main>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <MemberContent key={currentUser.id} currentUser={currentUser} />;
}

// 個人資訊、收藏、播放紀錄與留言來自後端。
function MemberContent({ currentUser }) {
  const { t } = useLanguage();
  const { logout, captureAuthSession, clearInvalidatedSession, updateCurrentUser } = useAuth();
  const { historyVersion } = useMusicPlayer();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(currentUser.username);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState(null);
  const [favoritesReload, setFavoritesReload] = useState(0);
  const [recentPlays, setRecentPlays] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(null);
  const [recentReload, setRecentReload] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsMoreLoading, setCommentsMoreLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsReload, setCommentsReload] = useState(0);
  const commentsMoreRequest = useRef(null);
  const [removingId, setRemovingId] = useState(null);
  const removingRef = useRef(false);
  const [notice, setNotice] = useState('');
  const [nicknameError, setNicknameError] = useState(null);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeView, setActiveView] = useState('favorites');
  const [passwordDraft, setPasswordDraft] = useState({ old: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const background = useBackgroundSlideshow({ images: memberImages, interval: 6000 });

  useEffect(() => {
    const controller = new AbortController();
    const session = captureAuthSession();
    // 登入會員改變或重新進入頁面時，重新取得後端排序的收藏清單。
    getFavorites(controller.signal)
      .then(setFavorites)
      .catch((error) => {
        if (controller.signal.aborted) return;
        setFavoritesError(error instanceof FavoritesApiError && error.status === 401
          ? 'favorites.sessionExpired' : 'favorites.loadError');
        if (error instanceof FavoritesApiError && error.status === 401) clearInvalidatedSession(session);
      })
      .finally(() => { if (!controller.signal.aborted) setFavoritesLoading(false); });
    return () => controller.abort();
  }, [currentUser.id, favoritesReload, captureAuthSession, clearInvalidatedSession]);

  useEffect(() => {
    if (activeView !== 'recent') return;
    const controller = new AbortController();
    const session = captureAuthSession();
    getPlayHistory(controller.signal)
      .then((codes) => {
        if (controller.signal.aborted) return;
        setRecentPlays(codes);
        setRecentError(null);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setRecentError(error instanceof PlayHistoryApiError && error.status === 401
          ? 'history.sessionExpired' : 'history.loadError');
        if (error instanceof PlayHistoryApiError && error.status === 401) clearInvalidatedSession(session);
      })
      .finally(() => { if (!controller.signal.aborted) setRecentLoading(false); });
    return () => controller.abort();
  }, [activeView, currentUser.id, historyVersion, recentReload, captureAuthSession, clearInvalidatedSession]);

  useEffect(() => {
    if (activeView !== 'comments') return;
    const controller = new AbortController();
    const session = captureAuthSession();
    // 頁籤重新開啟及同頁評論寫入時都重新讀第一頁。
    getMyComments(0, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setComments(result.items);
        setCommentsHasMore(result.hasMore);
        setCommentsPage(1);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setCommentsError(error instanceof CommentsApiError && error.status === 401
          ? 'comments.sessionExpired' : 'comments.loadError');
        if (error instanceof CommentsApiError && error.status === 401) clearInvalidatedSession(session);
      })
      .finally(() => { if (!controller.signal.aborted) setCommentsLoading(false); });
    return () => { controller.abort(); commentsMoreRequest.current?.abort(); };
  }, [activeView, currentUser.id, commentsReload, captureAuthSession, clearInvalidatedSession]);

  useEffect(() => {
    if (activeView !== 'comments') return;
    const reload = () => {
      setCommentsLoading(true);
      setCommentsError(null);
      setCommentsReload((value) => value + 1);
    };
    window.addEventListener('noirson:comments-changed', reload);
    return () => window.removeEventListener('noirson:comments-changed', reload);
  }, [activeView]);

  async function loadMoreComments() {
    if (commentsLoading || commentsMoreLoading || !commentsHasMore) return;
    const controller = new AbortController();
    const session = captureAuthSession();
    commentsMoreRequest.current = controller;
    setCommentsMoreLoading(true);
    setCommentsError(null);
    try {
      const result = await getMyComments(commentsPage, controller.signal);
      if (controller.signal.aborted) return;
      setComments((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...result.items.filter((item) => !seen.has(item.id))];
      });
      setCommentsHasMore(result.hasMore);
      setCommentsPage((page) => page + 1);
    } catch (error) {
      if (controller.signal.aborted) return;
      setCommentsError(error instanceof CommentsApiError && error.status === 401
        ? 'comments.sessionExpired' : 'comments.loadError');
      if (error instanceof CommentsApiError && error.status === 401) clearInvalidatedSession(session);
    } finally {
      if (!controller.signal.aborted) setCommentsMoreLoading(false);
    }
  }

  async function handleRemove(id) {
    if (removingRef.current) return;
    removingRef.current = true;
    const session = captureAuthSession();
    setRemovingId(id);
    setFavoritesError(null);
    try {
      await removeFavorite(id);
      setFavorites((current) => current.filter((item) => item !== id));
    } catch (error) {
      if (error instanceof FavoritesApiError && error.status === 401) {
        if (clearInvalidatedSession(session)) navigate('/login');
      } else {
        setFavoritesError('favorites.saveError');
      }
    } finally {
      removingRef.current = false;
      setRemovingId(null);
    }
  }

  async function saveNickname(event) {
    event.preventDefault();
    if (isSavingNickname) return;
    const value = draft.trim();
    if (value.length < 2 || value.length > 20) { setNicknameError('auth.usernameLength'); return; }
    setIsSavingNickname(true);
    const session = captureAuthSession();
    setNicknameError(null);
    setNotice('');
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: value }),
      });
      if (response.status === 200) {
        const user = await response.json();
        updateCurrentUser(user);
        setDraft(user.username);
        setNotice(t('member.saved'));
      } else if (response.status === 401) {
        if (clearInvalidatedSession(session)) navigate('/login', { replace: true });
      } else {
        setNicknameError(response.status === 400 ? 'auth.usernameLength' : 'auth.serverError');
      }
    } catch {
      setNicknameError('auth.networkError');
    } finally {
      setIsSavingNickname(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    if (isChangingPassword) return;
    const { old, next, confirm } = passwordDraft;
    if (!old || !next || !confirm) { setPasswordError('auth.required'); return; }
    if (next.length < 8 || next.length > 20) { setPasswordError('auth.passwordLength'); return; }
    if (!next.trim()) { setPasswordError('auth.passwordBlank'); return; }
    if (new TextEncoder().encode(next).length > 72) { setPasswordError('auth.passwordBytes'); return; }
    if (next !== confirm) { setPasswordError('auth.passwordMismatch'); return; }

    setIsChangingPassword(true);
    const session = captureAuthSession();
    setPasswordError(null);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: old, newPassword: next, confirmPassword: confirm }),
      });
      if (response.status === 204) {
        setPasswordDraft({ old: '', next: '', confirm: '' });
        if (clearInvalidatedSession(session)) navigate('/login', { replace: true, state: { passwordUpdated: true } });
      } else if (response.status === 401) {
        if (clearInvalidatedSession(session)) navigate('/login', { replace: true });
      } else if (response.status === 400) {
        const message = await response.text();
        setPasswordError(message === '目前密碼錯誤' ? 'member.currentPasswordInvalid'
          : message === '新密碼與舊密碼相同' ? 'member.samePassword' : 'member.passwordBadRequest');
      } else {
        setPasswordError('auth.serverError');
      }
    } catch {
      setPasswordError('auth.networkError');
    } finally {
      setIsChangingPassword(false);
    }
  }

  function changeView(view) {
    if (activeView === view) return;
    const hasUnsavedInput = activeView === 'edit' && (
      draft !== currentUser.username || Object.values(passwordDraft).some(Boolean)
    );
    if (hasUnsavedInput && !window.confirm(t('member.unsavedConfirm'))) return;
    if (activeView === 'edit') {
      setDraft(currentUser.username);
      setNicknameError(null);
      setPasswordDraft({ old: '', next: '', confirm: '' });
      setPasswordError(null);
      setNotice('');
    }
    if (view === 'comments') {
      setCommentsLoading(true);
      setCommentsMoreLoading(false);
      setCommentsError(null);
    }
    setActiveView(view);
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(false);
    try {
      const result = await logout();
      if (result === true) navigate('/');
      else if (result === false) setLogoutError(true);
    } catch {
      setLogoutError(true);
    } finally {
      setIsLoggingOut(false);
    }
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
          <div className="member-identity"><h1 id="member-profile-title">{currentUser.username}</h1><span>{currentUser.email}</span></div>
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
            <input id="member-nickname" value={draft} maxLength="20" required onChange={(event) => { setDraft(event.target.value); setNicknameError(null); setNotice(''); }} />
            <button type="submit" disabled={isSavingNickname}>{isSavingNickname ? t('member.saving') : t('member.save')}</button>
            {nicknameError && <p className="member-form-note" role="alert">{t(nicknameError)}</p>}
            {notice && <p className="member-form-note" role="status">{notice}</p>}
          </form>
        </section>
        <section className="member-section" aria-labelledby="member-password-title">
          <div className="member-section-heading"><h2 id="member-password-title">{t('member.password')}</h2></div>
          <form className="member-form" onSubmit={handleChangePassword}>
            <label htmlFor="member-old-password">{t('member.oldPassword')}</label><input id="member-old-password" type="password" autoComplete="current-password" value={passwordDraft.old} onChange={(event) => { setPasswordDraft((current) => ({ ...current, old: event.target.value })); setPasswordError(null); }} />
            <label htmlFor="member-new-password">{t('member.newPassword')}</label><input id="member-new-password" type="password" autoComplete="new-password" maxLength="20" value={passwordDraft.next} onChange={(event) => { setPasswordDraft((current) => ({ ...current, next: event.target.value })); setPasswordError(null); }} />
            <label htmlFor="member-confirm-password">{t('member.confirmPassword')}</label><input id="member-confirm-password" type="password" autoComplete="new-password" maxLength="20" value={passwordDraft.confirm} onChange={(event) => { setPasswordDraft((current) => ({ ...current, confirm: event.target.value })); setPasswordError(null); }} />
            <p className="member-form-note">{t('auth.passwordHint')}</p>
            <button type="submit" disabled={isChangingPassword}>{isChangingPassword ? t('member.changingPassword') : t('member.changePassword')}</button>
            {passwordError && <p className="member-form-note" role="alert">{t(passwordError)}</p>}
          </form>
        </section>
      </div>
          <div className="member-logout"><button type="button" onClick={handleLogout} disabled={isLoggingOut}>{t('member.logout')}</button>{logoutError && <p className="member-form-note" role="alert">{t('auth.logoutError')}</p>}</div>
      </>}

      {activeView === 'favorites' && <section className="member-section" aria-labelledby="member-favorites-title">
        <h2 className="visually-hidden" id="member-favorites-title">{t('member.favorites')}</h2>
        <div className="member-list">
          {favoritesLoading ? <p className="member-empty" role="status">{t('favorites.loading')}</p>
            : favoritesError === 'favorites.loadError' || favoritesError === 'favorites.sessionExpired'
              ? <p className="member-empty" role="alert">{t(favoritesError)}{' '}
                <button type="button" onClick={() => {
                  setFavoritesLoading(true);
                  setFavoritesError(null);
                  setFavoritesReload((value) => value + 1);
                }}>{t('auth.retry')}</button></p>
              : favorites.length ? favorites.map((id) => <MixRow key={id} id={id} action={<button className="member-remove" type="button"
                onClick={() => handleRemove(id)} disabled={removingId !== null}
                aria-label={`${t('member.remove')} ${mixes[id]?.title ?? id}`}>{t('member.remove')}</button>} />)
                : <p className="member-empty">{t('member.empty')}</p>}
          {favoritesError === 'favorites.saveError' && <p className="member-form-note" role="alert">{t(favoritesError)}</p>}
        </div>
      </section>}

      {activeView === 'comments' && <section className="member-section" aria-labelledby="member-comments-title">
        <h2 className="visually-hidden" id="member-comments-title">{t('member.comments')}</h2>
        <div className="member-list">
          {commentsLoading ? <p className="member-empty" role="status">{t('comments.loading')}</p>
            : commentsError && comments.length === 0 ? <p className="member-empty" role="alert">{t(commentsError)}{' '}
              <button type="button" onClick={() => {
                setCommentsLoading(true);
                setCommentsError(null);
                setCommentsReload((value) => value + 1);
              }}>{t('auth.retry')}</button></p>
              : comments.length ? comments.map((comment) => <article className="member-comment" key={comment.id}>
                <Link to={`/music/${comment.mixCode}`}><small>{comment.mixCode} / {mixes[comment.mixCode]?.title ?? comment.mixCode}</small><span aria-hidden="true">↗</span></Link>
                <p>{comment.content}</p><time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
              </article>) : <p className="member-empty">{t('comments.myEmpty')}</p>}
          {commentsError && comments.length > 0 && <p className="member-empty" role="alert">{t(commentsError)}{' '}
            <button type="button" onClick={loadMoreComments}>{t('auth.retry')}</button></p>}
          {commentsHasMore && !commentsLoading && !commentsError && <button className="member-comments-more" type="button"
            onClick={loadMoreComments} disabled={commentsMoreLoading}>{commentsMoreLoading ? t('comments.loading') : t('comments.loadMore')}</button>}
        </div>
      </section>}

      {activeView === 'recent' && <section className="member-section" aria-labelledby="member-recent-title">
        <h2 className="visually-hidden" id="member-recent-title">{t('member.recent')}</h2>
        <div className="member-list">
          {recentLoading ? <p className="member-empty" role="status">{t('history.loading')}</p>
            : recentError
              ? <p className="member-empty" role="alert">{t(recentError)}{' '}
                <button type="button" onClick={() => {
                  setRecentLoading(true);
                  setRecentError(null);
                  setRecentReload((value) => value + 1);
                }}>{t('auth.retry')}</button></p>
              : recentPlays.length ? recentPlays.map((id) => <MixRow key={id} id={id} />)
                : <p className="member-empty">{t('history.empty')}</p>}
        </div>
      </section>}

        </div>
      </section>
    </div>
  </main>;
}
