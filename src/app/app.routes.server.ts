import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'club', renderMode: RenderMode.Server },
  { path: 'equipos', renderMode: RenderMode.Server },
  { path: 'agenda', renderMode: RenderMode.Server },
  { path: 'galeria', renderMode: RenderMode.Server },
  { path: 'patrocinadores', renderMode: RenderMode.Server },
  { path: 'contacto', renderMode: RenderMode.Server },
  { path: 'noticia/:slug', renderMode: RenderMode.Server },
  { path: '404', renderMode: RenderMode.Server },
  { path: 'tienda', renderMode: RenderMode.Server },
  { path: 'tienda/checkout', renderMode: RenderMode.Client },
  { path: 'tienda/pedido/:orderNumber', renderMode: RenderMode.Server },
  { path: 'tienda/:slug', renderMode: RenderMode.Server },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
