const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiGet<T>(path: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API non configurée');
  }

  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Erreur API GET ${path}`);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API non configurée');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let msg = `Erreur ${response.status}`;
    try {
      const data = await response.json();
      if (data?.message) msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return (await response.json()) as T;
}

export function hasApiBaseUrl(): boolean {
  return Boolean(API_BASE_URL);
}
