import { API_ROOT } from '../api/vendorClient';

const ABSOLUTE_URL_REGEX = /^(https?:|data:|blob:)/i;

export function resolveMediaUrl(path?: string | null): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return '';
  }

  if (ABSOLUTE_URL_REGEX.test(trimmed) || trimmed.startsWith('//')) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/')) {
    const apiBase = API_ROOT.replace(/\/api(?:\/v\d+)?$/i, '');
    return `${apiBase}${trimmed}`;
  }

  if (trimmed.startsWith('uploads/')) {
    const apiBase = API_ROOT.replace(/\/api(?:\/v\d+)?$/i, '');
    return `${apiBase}/${trimmed}`;
  }

  if (trimmed.startsWith('/api/uploads/')) {
    const apiBase = API_ROOT.replace(/\/api(?:\/v\d+)?$/i, '');
    return `${apiBase}${trimmed}`;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return trimmed;
}

