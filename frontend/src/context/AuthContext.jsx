import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AuthContext from './authContext.js';

async function fetchCurrentUser() {
  const response = await fetch('/api/auth/me', { credentials: 'include' });
  if (response.status === 200) return { status: 200, user: await response.json() };
  if (response.status === 401) return { status: 401 };
  throw new Error('Unable to verify session');
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const requestId = useRef(0);
  const sessionOperation = useRef(false);

  const verifyCurrentUser = useCallback(async () => {
    const id = ++requestId.current;
    setIsAuthLoading(true);
    setAuthError(false);
    try {
      const result = await fetchCurrentUser();
      if (id === requestId.current) setCurrentUser(result.status === 200 ? result.user : null);
      return result.status;
    } catch {
      if (id === requestId.current) setAuthError(true);
      return null;
    } finally {
      if (id === requestId.current) setIsAuthLoading(false);
    }
  }, []);

  const refreshCurrentUser = useCallback(() => {
    if (sessionOperation.current) return Promise.resolve(null);
    return verifyCurrentUser();
  }, [verifyCurrentUser]);

  useEffect(() => {
    // 開發模式可能重送首次查詢；序號確保舊回應不覆寫新狀態。
    const id = ++requestId.current;
    fetchCurrentUser()
      .then((result) => {
        if (id !== requestId.current) return;
        setCurrentUser(result.status === 200 ? result.user : null);
        setAuthError(false);
      })
      .catch(() => { if (id === requestId.current) setAuthError(true); })
      .finally(() => { if (id === requestId.current) setIsAuthLoading(false); });
  }, []);

  const login = useCallback(async (email, password) => {
    if (sessionOperation.current) return null;
    sessionOperation.current = true;
    const id = ++requestId.current;
    setIsAuthLoading(true);
    setAuthError(false);
    let needsRefresh = false;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.status === 200) {
        const user = await response.json();
        if (id === requestId.current) setCurrentUser(user);
      } else if (response.status !== 400 && response.status !== 401) {
        needsRefresh = true;
      }
      return response.status;
    } catch {
      needsRefresh = true;
      throw new Error('Unable to complete login');
    } finally {
      try {
        if (needsRefresh) await verifyCurrentUser();
        else if (id === requestId.current) setIsAuthLoading(false);
      } finally {
        sessionOperation.current = false;
      }
    }
  }, [verifyCurrentUser]);

  const logout = useCallback(async () => {
    if (sessionOperation.current) return null;
    sessionOperation.current = true;
    const id = ++requestId.current; // 登出開始時立即淘汰較早的 /me 回應。
    setIsAuthLoading(true);
    setAuthError(false);
    let needsRefresh = false;
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (response.status !== 204) {
        needsRefresh = true;
        return false;
      }
      setCurrentUser(null);
      return true;
    } catch {
      needsRefresh = true;
      return false;
    } finally {
      try {
        if (needsRefresh) await verifyCurrentUser();
        else if (id === requestId.current) setIsAuthLoading(false);
      } finally {
        sessionOperation.current = false;
      }
    }
  }, [verifyCurrentUser]);

  const value = useMemo(() => ({ currentUser, isAuthLoading, authError, login, logout, refreshCurrentUser }),
    [currentUser, isAuthLoading, authError, login, logout, refreshCurrentUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
