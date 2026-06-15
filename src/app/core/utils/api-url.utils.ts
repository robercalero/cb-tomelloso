import { environment } from '../../../environments/environment';

export function getApiBaseUrl(): string {
  return environment.apiUrl;
}

export function resolveApiUrl(url: string | null | undefined): string {
  if (!url) return '';
  const clean = url.replace(/^\uFEFF/, '').trim();
  if (!clean) return '';
  if (clean.startsWith('/')) {
    const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
    return `${origin}${clean}`;
  }
  return clean;
}
