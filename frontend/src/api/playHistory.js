export class PlayHistoryApiError extends Error {
  constructor(status) {
    super(`Play history request failed: ${status}`);
    this.status = status;
  }
}

export async function getPlayHistory(signal) {
  const response = await fetch('/api/play-history', { credentials: 'include', signal });
  if (response.status !== 200) throw new PlayHistoryApiError(response.status);
  const codes = await response.json();
  if (!Array.isArray(codes) || !codes.every((code) => typeof code === 'string')) {
    throw new PlayHistoryApiError(500);
  }
  return codes;
}

export async function recordPlayHistory(code) {
  const response = await fetch(`/api/play-history/${encodeURIComponent(code)}`, {
    method: 'POST', credentials: 'include',
  });
  if (response.status !== 204) throw new PlayHistoryApiError(response.status);
}
