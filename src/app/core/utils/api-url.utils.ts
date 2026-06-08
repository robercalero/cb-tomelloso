import { environment } from '../../../environments/environment';

export function getApiBaseUrl(): string {
  if (environment.production) {
    return environment.apiUrl;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
  }
  return 'http://localhost:3000/api/v1';
}

export function resolveApiUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('/api/')) {
    if (environment.production) {
      const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
      return `${origin}${url}`;
    }
    const origin = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3000`
      : 'http://localhost:3000';
    return `${origin}${url}`;
  }
  return url;
}
