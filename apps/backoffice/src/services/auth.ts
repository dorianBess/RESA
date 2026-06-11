import type { UserSession } from '../types';
import { apiPost, clearAuthToken, setAuthToken } from './api';

type LoginResponse = {
  accessToken: string;
  expiresAt: string;
};

const SESSION_KEY = 'resa_session';

export async function login(email: string, password: string): Promise<UserSession> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, motDePasse: password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Identifiants incorrects.');
  }

  const data: { accessToken: string } = await res.json();
  const session: UserSession = { email, tenantName: email, accessToken: data.accessToken };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getStoredSession(): UserSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function logout(): void {
  clearAuthToken();
}
