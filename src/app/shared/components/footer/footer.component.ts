import { ChangeDetectionStrategy, Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  private platformId = inject(PLATFORM_ID);
  readonly year = signal(isPlatformBrowser(this.platformId) ? new Date().getFullYear() : 2024);

  readonly socialLinks = [
    { icon: 'instagram', url: 'https://www.instagram.com/cbtomelloso', label: 'Instagram' },
    { icon: 'twitter', url: 'https://x.com/cbttomelloso', label: 'Twitter/X' },
    { icon: 'facebook', url: 'https://www.facebook.com/cbtomelloso', label: 'Facebook' },
    { icon: 'youtube', url: 'https://www.youtube.com/@cbt2019', label: 'YouTube' }
  ];

  readonly quickLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'El Club', path: '/club' },
    { label: 'Equipos', path: '/equipos' },
    { label: 'Agenda', path: '/agenda' },
    { label: 'Galería', path: '/galeria' },
    { label: 'Patrocinadores', path: '/patrocinadores' },
    { label: 'Contacto', path: '/contacto' }
  ];

  readonly legalLinks = [
    { label: 'Política de Privacidad', path: '/club' },
    { label: 'Aviso Legal', path: '/club' },
    { label: 'Política de Cookies', path: '/club' }
  ];
}
