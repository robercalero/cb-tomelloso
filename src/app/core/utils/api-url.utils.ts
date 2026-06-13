import { environment } from '../../../environments/environment';

export function getApiBaseUrl(): string {
  return environment.apiUrl;
}

export function resolveApiUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('/')) {
    const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
    return `${origin}${url}`;
  }
  return url;
}
