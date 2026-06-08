export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'cb-tomelloso-web.onrender.com' || hostname.includes('onrender')) {
      return 'https://cb-tomelloso-api.onrender.com/api/v1';
    }
    return `${window.location.protocol}//${hostname}:3000/api/v1`;
  }
  return 'https://cb-tomelloso-api.onrender.com/api/v1';
}

function getApiOrigin(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'cb-tomelloso-web.onrender.com' || hostname.includes('onrender')) {
      return 'https://cb-tomelloso-api.onrender.com';
    }
    return `${window.location.protocol}//${hostname}:3000`;
  }
  return 'https://cb-tomelloso-api.onrender.com';
}

export function resolveApiUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('/api/') || url.startsWith('/media/')) {
    return `${getApiOrigin()}${url}`;
  }
  return url;
}
