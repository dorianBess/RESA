import type { UserSession } from '../types';

export async function login(email: string, password: string): Promise<UserSession> {
  if (!email || !password) {
    throw new Error('Email et mot de passe requis.');
  }

  return {
    email,
    tenantName: 'Résa Demo Hébergeur',
  };
}
