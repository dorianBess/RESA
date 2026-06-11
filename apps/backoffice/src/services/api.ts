const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

type FetchOptions = RequestInit & { body?: unknown };

function buildHeaders(init?: HeadersInit, method?: string): Headers {
  const headers = new Headers(init);

  if (method && method !== 'GET' && method !== 'HEAD' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('resa_backoffice_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers, options.method),
    body: options.body != null && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`Erreur API ${options.method ?? 'GET'} ${path}: ${response.status} ${raw}`);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body });
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export function setAuthToken(token: string): void {
  localStorage.setItem('resa_backoffice_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('resa_backoffice_token');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('resa_backoffice_token');
}
