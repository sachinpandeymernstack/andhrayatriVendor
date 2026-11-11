import { getVendorSession, clearVendorSession } from '../lib/vendorSession';
import type { VendorProduct, VendorRecord } from '../types/vendor';

const DEFAULT_API_ROOT = 'https://api.andhrayatri.com/api/v1';

export const API_ROOT: string = (
  import.meta.env.VITE_API_BASE_URL ||
  DEFAULT_API_ROOT
).replace(/\/+$/, '');

export const API_BASES = {
  vendor: `${API_ROOT}/vendor`,
  product: `${API_ROOT}/product`,
  shopOrder: `${API_ROOT}/shop-order`,
};

function resolveRequestCredentials(url: string, override?: RequestCredentials): RequestCredentials {
  if (override) return override;
  if (typeof window === 'undefined') return 'same-origin';
  try {
    const targetOrigin = new URL(url, window.location.origin).origin;
    return targetOrigin === window.location.origin ? 'include' : 'omit';
  } catch {
    return 'same-origin';
  }
}

export function extractErrorMessage(payload: unknown, fallback = 'Request failed'): string {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidate = record.message || record.error || record.detail;
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
    if (Array.isArray(record.errors) && record.errors.length > 0) {
      const first = record.errors[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && typeof (first as { msg?: string }).msg === 'string') {
        return (first as { msg: string }).msg;
      }
    }
  }
  return fallback;
}

export function getApiError(error: unknown, fallback = 'Unable to connect to the server'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || fallback;
  return extractErrorMessage(error, fallback);
}

interface RequestOptions extends RequestInit {
  anonymous?: boolean;
}

export async function apiRequest<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!options.anonymous) {
    const session = getVendorSession();
    const token = session?.token || '';
    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: resolveRequestCredentials(url, options.credentials),
    });
  } catch {
    throw new Error(
      `Unable to reach the Andhra Yatri API at ${API_ROOT}. Please check your connection or API settings.`,
    );
  }

  const contentType = response.headers?.get?.('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = extractErrorMessage(payload, `Request failed with status ${response.status}`);
    if (response.status === 401 && !url.includes('/login')) {
      clearVendorSession();
    }
    throw new Error(message);
  }

  return payload as T;
}

export interface VendorLoginResponse {
  token?: string;
  vendor?: VendorRecord;
  user?: VendorRecord;
  data?: VendorRecord & { token?: string };
  message?: string;
  [key: string]: unknown;
}

export const vendorApi = {
  loginVendor({ email, password }: { email: string; password: string }) {
    return apiRequest<VendorLoginResponse>(`${API_BASES.vendor}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      anonymous: true,
    });
  },

  signupVendor(payload: Record<string, unknown>) {
    return apiRequest<VendorLoginResponse>(`${API_BASES.vendor}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      anonymous: true,
    });
  },

  updateVendor(vendorId: string, payload: Record<string, unknown>, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return apiRequest<VendorRecord | { vendor?: VendorRecord }>(
      `${API_BASES.vendor}/update/${encodeURIComponent(vendorId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      },
    );
  },

  getVendorProfile(vendorId: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return apiRequest<VendorRecord | { vendor?: VendorRecord; data?: VendorRecord }>(
      `${API_BASES.vendor}/${encodeURIComponent(vendorId)}`,
      {
        method: 'GET',
        headers,
      },
    );
  },

  getAllVendors() {
    return apiRequest<VendorRecord[] | { vendors?: VendorRecord[] }>(`${API_BASES.vendor}/all`, {
      anonymous: true,
    });
  },
};

export const productApi = {
  getByCategory(category: string) {
    return apiRequest<VendorProduct[] | { products?: VendorProduct[] }>(
      `${API_BASES.product}/category/${encodeURIComponent(category)}`,
    );
  },

  getByVendor(vendorId: string) {
    return apiRequest<VendorProduct[] | { products?: VendorProduct[] }>(
      `${API_BASES.product}/by-vendor/${encodeURIComponent(vendorId)}`,
    );
  },

  addProduct(payload: Partial<VendorProduct>) {
    return apiRequest<{ product?: VendorProduct; message?: string }>(`${API_BASES.product}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  updateProduct(productId: string, payload: Partial<VendorProduct>) {
    return apiRequest<{ product?: VendorProduct; message?: string }>(
      `${API_BASES.product}/update/${encodeURIComponent(productId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
  },

  deleteProduct(productId: string) {
    return apiRequest<{ message?: string }>(
      `${API_BASES.product}/delete/${encodeURIComponent(productId)}`,
      { method: 'DELETE' },
    );
  },
};

export const shopOrderApi = {
  getVendorOrders(vendorId: string) {
    return apiRequest<unknown[] | { orders?: unknown[]; results?: unknown[]; data?: unknown[] }>(
      `${API_BASES.shopOrder}/vendor/${encodeURIComponent(vendorId)}`,
    );
  },

  updateOrderStatus(orderId: string, nextStatus: string, payload: Record<string, unknown> = {}) {
    return apiRequest(`${API_BASES.shopOrder}/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, ...payload }),
    });
  },
};

