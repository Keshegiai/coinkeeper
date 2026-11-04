export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
  get isNetwork() {
    return this.status === 0;
  }
}

type Json = Record<string, unknown> | unknown[];

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Json;
  query?: Record<string, string | number | undefined>;
  /**
   * Equality filters. Sent as json-server's `_where` JSON so values keep their
   * type — plain `?userId=9450` gets coerced to a number and never matches "9450".
   */
  where?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

function buildUrl(path: string, query?: RequestOptions['query'], where?: RequestOptions['where']) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined) qs.set(k, String(v));
  if (where) qs.set('_where', JSON.stringify(Object.fromEntries(Object.entries(where).map(([k, v]) => [k, { eq: v }]))));
  const s = qs.toString();
  return `${API_BASE_URL}${path}${s ? `?${s}` : ''}`;
}

export async function request<T>(path: string, { method = 'GET', body, query, where, signal }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query, where), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new ApiError('Сервер недоступен. Проверьте, что запущен API (npm run api).', 0);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg = extractMessage(data) ?? (res.statusText || 'Неизвестная ошибка');
    throw new ApiError(res.status === 401 ? 'Сессия истекла. Войдите снова.' : msg, res.status);
  }
  return data as T;
}

function extractMessage(data: unknown): string | null {
  if (typeof data === 'string' && data) return data;
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') return data.message;
  return null;
}

export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Что-то пошло не так';
}
