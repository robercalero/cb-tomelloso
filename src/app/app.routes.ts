import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Rutas públicas ──────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Inicio - CB Tomelloso',
  },
  {
    path: 'club',
    loadComponent: () => import('./features/club/club.component').then(m => m.ClubComponent),
    title: 'El Club - CB Tomelloso',
  },
  {
    path: 'equipos',
    loadComponent: () => import('./features/teams/teams.component').then(m => m.TeamsComponent),
    title: 'Equipos - CB Tomelloso',
  },
  {
    path: 'agenda',
    loadComponent: () => import('./features/agenda/agenda.component').then(m => m.AgendaComponent),
    title: 'Agenda - CB Tomelloso',
  },
  {
    path: 'galeria',
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Galería - CB Tomelloso',
  },
  {
    path: 'patrocinadores',
    loadComponent: () => import('./features/sponsors/sponsors.component').then(m => m.SponsorsComponent),
    title: 'Patrocinadores - CB Tomelloso',
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contacto - CB Tomelloso',
  },
  {
    path: 'noticia/:slug',
    loadComponent: () => import('./features/news-detail/news-detail.component').then(m => m.NewsDetailComponent),
    title: 'Noticia - CB Tomelloso',
  },
  {
    path: 'tienda',
    loadChildren: () => import('./features/shop/shop.routes').then(m => m.shopRoutes),
  },

  // ── Admin login (público) ────────────────────────────
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Acceso Admin — CB Tomelloso',
  },

  // ── Panel de Administración (protegido) ──────────────
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['admin', 'editor'] },
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Dashboard — CB Tomelloso',
      },
      {
        path: 'noticias',
        loadComponent: () => import('./features/admin/news/admin-news.component').then(m => m.AdminNewsComponent),
        title: 'Noticias — Admin',
      },
      {
        path: 'noticias/nueva',
        loadComponent: () => import('./features/admin/news/admin-news-form.component').then(m => m.AdminNewsFormComponent),
        title: 'Nueva noticia — Admin',
      },
      {
        path: 'noticias/:slug',
        loadComponent: () => import('./features/admin/news/admin-news-form.component').then(m => m.AdminNewsFormComponent),
        title: 'Editar noticia — Admin',
      },
      {
        path: 'partidos',
        loadComponent: () => import('./features/admin/matches/admin-matches.component').then(m => m.AdminMatchesComponent),
        title: 'Partidos — Admin',
      },
      {
        path: 'partidos/nuevo',
        loadComponent: () => import('./features/admin/matches/admin-matches-form.component').then(m => m.AdminMatchesFormComponent),
        title: 'Nuevo partido — Admin',
      },
      {
        path: 'partidos/:id',
        loadComponent: () => import('./features/admin/matches/admin-matches-form.component').then(m => m.AdminMatchesFormComponent),
        title: 'Editar partido — Admin',
      },
      {
        path: 'equipos',
        loadComponent: () => import('./features/admin/teams/admin-teams.component').then(m => m.AdminTeamsComponent),
        title: 'Equipos — Admin',
      },
      {
        path: 'equipos/nuevo',
        loadComponent: () => import('./features/admin/teams/admin-teams-form.component').then(m => m.AdminTeamsFormComponent),
        title: 'Nuevo equipo — Admin',
      },
      {
        path: 'equipos/:id',
        loadComponent: () => import('./features/admin/teams/admin-teams-form.component').then(m => m.AdminTeamsFormComponent),
        title: 'Editar equipo — Admin',
      },
      {
        path: 'tienda',
        loadComponent: () => import('./features/shop/admin/admin-products/admin-products.component').then(m => m.AdminProductsComponent),
        title: 'Tienda — Admin',
      },
      {
        path: 'tienda/nuevo',
        loadComponent: () => import('./features/shop/admin/admin-product-form/admin-product-form.component').then(m => m.AdminProductFormComponent),
        title: 'Nuevo producto — Admin',
      },
      {
        path: 'tienda/:slug',
        loadComponent: () => import('./features/shop/admin/admin-product-form/admin-product-form.component').then(m => m.AdminProductFormComponent),
        title: 'Editar producto — Admin',
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent),
        title: 'Pedidos — Admin',
      },
      {
        path: 'pedidos/:orderNumber',
        loadComponent: () => import('./features/admin/orders/admin-orders-detail.component').then(m => m.AdminOrdersDetailComponent),
        title: 'Detalle del pedido — Admin',
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./features/admin/messages/admin-messages.component').then(m => m.AdminMessagesComponent),
        title: 'Mensajes — Admin',
      },
      {
        path: 'socios',
        loadComponent: () => import('./features/admin/members/admin-members.component').then(m => m.AdminMembersComponent),
        title: 'Socios — Admin',
      },
    ],
  },

  // ── 404 ──────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];
