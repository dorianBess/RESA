import type { UserSession } from '../types';
import { apiPost, clearAuthToken, setAuthToken } from './api';

type LoginResponse = {
  accessToken: string;
  expiresAt: string;
};

export async function login(email: string, password: string): Promise<UserSession> {
  if (!email || !password) {
    throw new Error('Email et mot de passe requis.');
  }

  const response = await apiPost<LoginResponse>('/auth/login', {
    email,
    motDePasse: password,
  });

  setAuthToken(response.accessToken);

  return {
    email,
    tenantName: 'Résa Demo Hébergeur',
  };
}

export function logout(): void {
  clearAuthToken();
}
