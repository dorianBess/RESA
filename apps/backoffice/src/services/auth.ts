import type { UserSession } from '../types';
import { apiPost, clearAuthToken, setAuthToken } from './api';

type LoginResponse = {
  accessToken: string;
  expiresAt: string;
};

const SESSION_KEY = 'resa_session';

export async function login(email: string, password: string): Promise<UserSession> {
  const data = await apiPost<{ accessToken: string }>('/auth/login', {
    email,
    motDePasse: password,
  });

  setAuthToken(data.accessToken);
  const session: UserSession = { email, tenantName: email, accessToken: data.accessToken };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  clearAuthToken();
}

export function getStoredSession(): UserSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as UserSession;
    if (session.accessToken) setAuthToken(session.accessToken);
    return session;
  } catch {
    return null;
  }
}
