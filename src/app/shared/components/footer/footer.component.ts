import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
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
    { label: 'Política de Privacidad', path: '#' },
    { label: 'Aviso Legal', path: '#' },
    { label: 'Política de Cookies', path: '#' }
  ];
}
