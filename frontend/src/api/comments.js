export class CommentsApiError extends Error {
  constructor(status) {
    super(`Comments request failed: ${status}`);
    this.status = status;
  }
}

const MIX_PAGE_SIZE = 5;
const MEMBER_PAGE_SIZE = 10;

function checkPage(data) {
  if (!data || !Array.isArray(data.items) || typeof data.hasMore !== 'boolean'
    || !data.items.every((item) => Number.isInteger(item.id) && typeof item.content === 'string')) {
    throw new CommentsApiError(500);
  }
  return data;
}

async function readPage(url, signal) {
  const response = await fetch(url, { credentials: 'include', signal });
  if (response.status !== 200) throw new CommentsApiError(response.status);
  return checkPage(await response.json());
}

export function getMixComments(code, page = 0, signal) {
  return readPage(`/api/mixes/${encodeURIComponent(code)}/comments?page=${page}&size=${MIX_PAGE_SIZE}`, signal);
}

export function getMyComments(page = 0, signal) {
  return readPage(`/api/members/me/comments?page=${page}&size=${MEMBER_PAGE_SIZE}`, signal);
}

async function writeComment(url, method, content) {
  const response = await fetch(url, {
    method, credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (response.status !== (method === 'POST' ? 201 : 200)) throw new CommentsApiError(response.status);
  const comment = await response.json();
  window.dispatchEvent(new Event('noirson:comments-changed'));
  return comment;
}

export function addComment(code, content) {
  return writeComment(`/api/mixes/${encodeURIComponent(code)}/comments`, 'POST', content);
}

export function updateComment(id, content) {
  return writeComment(`/api/comments/${encodeURIComponent(id)}`, 'PATCH', content);
}

export async function deleteComment(id) {
  const response = await fetch(`/api/comments/${encodeURIComponent(id)}`, {
    method: 'DELETE', credentials: 'include',
  });
  if (response.status !== 204) throw new CommentsApiError(response.status);
  window.dispatchEvent(new Event('noirson:comments-changed'));
}
