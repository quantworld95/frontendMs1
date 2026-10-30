import type { ApiErrorBody } from '@/types/alojamientos';
import { getSessionToken } from '@/api/sessionToken';

const DEFAULT_BASE_URL = 'http://localhost:8081';

export class ApiError extends Error {
  readonly status: number;
  readonly codigo: string;

  constructor(status: number, codigo: string, mensaje: string) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
  }
}

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL === '') return '';
  const url = import.meta.env.VITE_API_URL?.trim();
  return url || DEFAULT_BASE_URL;
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${getApiBaseUrl()}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function parseError(response: Response): Promise<ApiError> {
  let codigo = `HTTP_${response.status}`;
  let mensaje = response.statusText || 'Error de comunicación con la API';
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body.codigo) codigo = body.codigo;
    if (body.mensaje) mensaje = body.mensaje;
  } catch {
    // ignore non-JSON error bodies
  }
  return new ApiError(response.status, codigo, mensaje);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const token = getSessionToken();

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      ...(isFormData || body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const apiClient = {
  get: <T>(path: string, query?: RequestOptions['query']) =>
    apiRequest<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown, query?: RequestOptions['query']) =>
    apiRequest<T>(path, { method: 'POST', body, query }),
  put: <T>(path: string, body?: unknown, query?: RequestOptions['query']) =>
    apiRequest<T>(path, { method: 'PUT', body, query }),
};
