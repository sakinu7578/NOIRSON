export class FavoritesApiError extends Error {
  constructor(status) {
    super(`Favorites request failed: ${status}`);
    this.status = status;
  }
}

export async function getFavorites(signal) {
  const response = await fetch('/api/favorites', { credentials: 'include', signal });
  if (response.status !== 200) throw new FavoritesApiError(response.status);
  const codes = await response.json();
  if (!Array.isArray(codes) || !codes.every((code) => typeof code === 'string')) {
    throw new FavoritesApiError(500);
  }
  return codes;
}

export async function addFavorite(code) {
  const response = await fetch(`/api/favorites/${encodeURIComponent(code)}`, {
    method: 'POST', credentials: 'include',
  });
  if (response.status !== 201 && response.status !== 200) {
    throw new FavoritesApiError(response.status);
  }
}

export async function removeFavorite(code) {
  const response = await fetch(`/api/favorites/${encodeURIComponent(code)}`, {
    method: 'DELETE', credentials: 'include',
  });
  if (response.status !== 204) throw new FavoritesApiError(response.status);
}
