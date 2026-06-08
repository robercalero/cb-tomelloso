import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Inicio - CB Tomelloso'
  },
  {
    path: 'club',
    loadComponent: () => import('./features/club/club.component').then(m => m.ClubComponent),
    title: 'El Club - CB Tomelloso'
  },
  {
    path: 'equipos',
    loadComponent: () => import('./features/teams/teams.component').then(m => m.TeamsComponent),
    title: 'Equipos - CB Tomelloso'
  },
  {
    path: 'agenda',
    loadComponent: () => import('./features/agenda/agenda.component').then(m => m.AgendaComponent),
    title: 'Agenda - CB Tomelloso'
  },
  {
    path: 'galeria',
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Galería - CB Tomelloso'
  },
  {
    path: 'patrocinadores',
    loadComponent: () => import('./features/sponsors/sponsors.component').then(m => m.SponsorsComponent),
    title: 'Patrocinadores - CB Tomelloso'
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contacto - CB Tomelloso'
  },
  {
    path: 'noticia/:slug',
    loadComponent: () => import('./features/news-detail/news-detail.component').then(m => m.NewsDetailComponent),
    title: 'Noticia - CB Tomelloso'
  },
  { path: '**', redirectTo: '' }
];
