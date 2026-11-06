import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { addComment, CommentsApiError, deleteComment, getMixComments, likeComment, unlikeComment, updateComment } from '../api/comments.js';
import useAuth from '../hooks/useAuth.js';
import useLanguage from '../hooks/useLanguage.js';
import { formatCommentDate } from '../utils/formatCommentDate.js';

function mergeById(existing, incoming) {
  const seen = new Set(existing.map((item) => item.id));
  return [...existing, ...incoming.filter((item) => !seen.has(item.id))];
}

function fitTextarea(element) {
  if (!element) return;
  element.style.height = '46px';
  element.style.height = `${Math.min(element.scrollHeight, 104)}px`;
}

export default function CommentSection({ pageMixId }) {
  const { t } = useLanguage();
  const { currentUser, isAuthLoading, captureAuthSession, clearInvalidatedSession } = useAuth();
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState('');
  const [likeErrors, setLikeErrors] = useState({});
  const [likingIds, setLikingIds] = useState(new Set());
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const mounted = useRef(true);
  const request = useRef(null);
  const savingRef = useRef(false);
  const likeRequests = useRef(new Map());

  useEffect(() => {
    mounted.current = true;
    const pendingLikes = likeRequests.current;
    return () => {
      mounted.current = false;
      request.current?.abort();
      pendingLikes.forEach((controller) => controller.abort());
      pendingLikes.clear();
    };
  }, []);

  const loadFirst = useCallback(() => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setMoreLoading(false);
    setLoadError(false);
    getMixComments(pageMixId, 0, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setItems(result.items);
        setHasMore(result.hasMore);
        setNextPage(1);
      })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  }, [pageMixId]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) loadFirst(); });
    return () => { active = false; request.current?.abort(); };
  }, [loadFirst, reload]);

  async function loadMore() {
    if (loading || moreLoading || !hasMore) return;
    const controller = new AbortController();
    request.current = controller;
    setMoreLoading(true);
    setLoadError(false);
    try {
      const result = await getMixComments(pageMixId, nextPage, controller.signal);
      if (controller.signal.aborted || !mounted.current) return;
      // offset 分頁期間可能插入新留言，依 id 合併可避免畫面重複。
      setItems((current) => mergeById(current, result.items));
      setHasMore(result.hasMore);
      setNextPage((page) => page + 1);
    } catch {
      if (!controller.signal.aborted && mounted.current) setLoadError(true);
    } finally {
      if (mounted.current && !controller.signal.aborted) setMoreLoading(false);
    }
  }

  function errorKey(error, session) {
    if (!(error instanceof CommentsApiError)) return 'comments.saveError';
    if (error.status === 400) return 'comments.invalid';
    if (error.status === 401) { clearInvalidatedSession(session); return 'comments.sessionExpired'; }
    if (error.status === 403) return 'comments.forbidden';
    if (error.status === 404) return 'comments.notFound';
    if (error.status === 429) return 'comments.cooldown';
    return 'comments.saveError';
  }

  async function save(action) {
    if (savingRef.current || isAuthLoading || !currentUser) return;
    const content = action === 'create' ? draft.trim() : editDraft.trim();
    if (!content) { setActionError('comments.required'); return; }
    if ([...content].length > 500) { setActionError('comments.tooLong'); return; }
    savingRef.current = true;
    const session = captureAuthSession();
    setSaving(true);
    setActionError('');
    try {
      if (action === 'create') {
        await addComment(pageMixId, content);
        if (mounted.current) setDraft('');
      } else {
        await updateComment(editingId, content);
        if (mounted.current) { setEditingId(null); setEditDraft(''); }
      }
      if (mounted.current) loadFirst();
    } catch (error) {
      const key = errorKey(error, session);
      if (mounted.current) setActionError(key);
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  async function remove(id) {
    if (savingRef.current || !currentUser || !window.confirm(t('comments.deleteConfirm'))) return;
    savingRef.current = true;
    const session = captureAuthSession();
    setSaving(true);
    setActionError('');
    try {
      await deleteComment(id);
      if (mounted.current) { setEditingId(null); loadFirst(); }
    } catch (error) {
      const key = errorKey(error, session);
      if (mounted.current) setActionError(key);
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  async function toggleLike(comment) {
    if (!currentUser || isAuthLoading || likeRequests.current.has(comment.id)) return;
    const controller = new AbortController();
    const session = captureAuthSession();
    likeRequests.current.set(comment.id, controller);
    setLikingIds((current) => new Set(current).add(comment.id));
    setLikeErrors((current) => ({ ...current, [comment.id]: null }));
    try {
      if (comment.likedByMe) await unlikeComment(comment.id, controller.signal);
      else await likeComment(comment.id, controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      // 載入更多的舊回應不可蓋掉剛完成的單則按讚狀態。
      request.current?.abort();
      setMoreLoading(false);
      setItems((current) => current.map((item) => item.id === comment.id
        ? { ...item, likedByMe: !comment.likedByMe,
          likeCount: Math.max(0, item.likeCount + (comment.likedByMe ? -1 : 1)) }
        : item));
    } catch (error) {
      if (!controller.signal.aborted && error instanceof CommentsApiError && error.status === 401) {
        clearInvalidatedSession(session);
      }
      if (!mounted.current || controller.signal.aborted) return;
      if (error instanceof CommentsApiError && error.status === 404) loadFirst();
      setLikeErrors((current) => ({ ...current, [comment.id]: error instanceof CommentsApiError && error.status === 401
        ? 'comments.sessionExpired' : error instanceof CommentsApiError && error.status === 404
          ? 'comments.notFound' : 'comments.likeError' }));
    } finally {
      likeRequests.current.delete(comment.id);
      if (mounted.current) setLikingIds((current) => {
        const next = new Set(current);
        next.delete(comment.id);
        return next;
      });
    }
  }

  return <section className="detail-comments" aria-labelledby="detail-comments-title">
    <div className="detail-comments-heading"><h2 id="detail-comments-title">{t('detail.comments')}</h2></div>
    {currentUser ? <div className="detail-comment-compose">
      <label className="visually-hidden" htmlFor="detail-comment">{t('detail.comment')}</label>
      <textarea id="detail-comment" rows="1" placeholder={t('detail.comment')} value={draft}
        ref={fitTextarea} onChange={(event) => { setDraft(event.target.value); fitTextarea(event.target); }}
        disabled={saving || isAuthLoading} />
      <button className="detail-comment-submit" type="button" onClick={() => save('create')}
        disabled={saving || isAuthLoading || !draft.trim()}>{t('comments.post')}</button>
    </div> : <p className="detail-comments-empty">{t('comments.loginPrompt')} <Link to="/login">{t('auth.login')}</Link></p>}
    {actionError && <p className="detail-comment-notice" role="alert">{t(actionError)}</p>}
    <div className="detail-comment-list" aria-live="polite">
      {loading ? <p className="detail-comments-empty" role="status">{t('comments.loading')}</p>
        : loadError && items.length === 0 ? <p className="detail-comments-empty" role="alert">{t('comments.loadError')}{' '}
          <button type="button" onClick={() => setReload((value) => value + 1)}>{t('auth.retry')}</button></p>
          : items.length === 0 ? <p className="detail-comments-empty">{t('comments.empty')}</p>
            : items.map((comment) => <article className="detail-comment-item" key={comment.id}>
              <div className="detail-comment-header">
                <div className="detail-comment-meta"><strong>{comment.authorName}</strong>
                  <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time></div>
                {editingId !== comment.id && (currentUser?.id === comment.authorId || currentUser?.role === 'ADMIN') && <div className="detail-comment-actions">
                  {currentUser?.id === comment.authorId && <button type="button" onClick={() => { setEditingId(comment.id); setEditDraft(comment.content); setActionError(''); }} disabled={saving}>{t('comments.edit')}</button>}
                  <button type="button" onClick={() => remove(comment.id)} disabled={saving}>{t('comments.delete')}</button>
                </div>}
              </div>
              <div className="detail-comment-body">
                <div className="detail-comment-content">{editingId === comment.id ? <>
                <label className="visually-hidden" htmlFor={`edit-comment-${comment.id}`}>{t('comments.edit')}</label>
                <textarea className="detail-comment-edit" id={`edit-comment-${comment.id}`} value={editDraft} rows="1"
                  ref={fitTextarea} onChange={(event) => { setEditDraft(event.target.value); fitTextarea(event.target); }} disabled={saving} />
                <div className="detail-comment-actions">
                  <button type="button" onClick={() => save('edit')} disabled={saving || !editDraft.trim()}>{t('comments.save')}</button>
                  <button type="button" onClick={() => { setEditingId(null); setEditDraft(''); }} disabled={saving}>{t('comments.cancel')}</button>
                </div>
                </> : <p>{comment.content}</p>}</div>
                <div className="detail-comment-likes">
                {currentUser ? <button type="button" aria-pressed={comment.likedByMe}
                  aria-label={t(comment.likedByMe ? 'comments.unlike' : 'comments.like')}
                  onClick={() => toggleLike(comment)} disabled={isAuthLoading || likingIds.has(comment.id)}>
                  <span aria-hidden="true">♥</span><span>{comment.likeCount}</span>
                </button> : <span className="detail-comment-likes-count" aria-label={`${t('comments.likes')}: ${comment.likeCount}`}>
                  <span aria-hidden="true">♥</span>{comment.likeCount}
                </span>}
                {likeErrors[comment.id] && <span role="alert" className="detail-comment-like-error">{t(likeErrors[comment.id])}</span>}
                </div>
              </div>
            </article>)}
    </div>
    {!currentUser && !loading && items.length > 0 && <p className="detail-comment-like-hint">
      <Link to="/login">{t('comments.loginToLike')}</Link>
    </p>}
    {loadError && items.length > 0 && <p className="detail-comment-notice" role="alert">{t('comments.loadError')}{' '}
      <button type="button" onClick={loadMore}>{t('auth.retry')}</button></p>}
    {hasMore && !loading && !loadError && <button className="detail-comment-more" type="button"
      onClick={loadMore} disabled={moreLoading}>{moreLoading ? t('comments.loading') : t('comments.loadMore')}</button>}
  </section>;
}
