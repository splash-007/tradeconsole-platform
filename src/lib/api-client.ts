// BACKEND INTEGRATION: Replace base URL with NEXT_PUBLIC_API_BASE_URL for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.core-domain.com';
const DATA_MODE = process.env.NEXT_PUBLIC_DATA_MODE || 'mock';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    if (DATA_MODE === 'mock') {
      return { data: null, error: 'mock mode', status: 200 };
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return { data: null, error: res.statusText, status: res.status };
      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch (e) {
      return { data: null, error: 'Network error', status: 0 };
    }
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    if (DATA_MODE === 'mock') {
      return { data: null, error: 'mock mode', status: 200 };
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { data: null, error: res.statusText, status: res.status };
      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch (e) {
      return { data: null, error: 'Network error', status: 0 };
    }
  }

  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    if (DATA_MODE === 'mock') {
      return { data: null, error: 'mock mode', status: 200 };
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { data: null, error: res.statusText, status: res.status };
      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch (e) {
      return { data: null, error: 'Network error', status: 0 };
    }
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    if (DATA_MODE === 'mock') {
      return { data: null, error: 'mock mode', status: 200 };
    }
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return { data: null, error: res.statusText, status: res.status };
      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch (e) {
      return { data: null, error: 'Network error', status: 0 };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { DATA_MODE };