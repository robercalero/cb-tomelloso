import { ChangeDetectionStrategy, Component, HostListener, signal, inject, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive, NavigationEnd, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly isScrolled = signal(false);
  readonly isMobileMenuOpen = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.isMobileMenuOpen.set(false);
    });
  }

  readonly navLinks: NavLink[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Club', path: '/club' },
    { label: 'Equipos', path: '/equipos' },
    { label: 'Agenda', path: '/agenda' },
    { label: 'Galería', path: '/galeria' },
    { label: 'Patrocinadores', path: '/patrocinadores' },
    { label: 'Contacto', path: '/contacto' }
  ];

  readonly socialLinks = [
    { icon: 'instagram', url: 'https://www.instagram.com/cbtomelloso', label: 'Instagram' },
    { icon: 'twitter', url: 'https://x.com/cbttomelloso', label: 'Twitter/X' },
    { icon: 'facebook', url: 'https://www.facebook.com/cbtomelloso', label: 'Facebook' },
    { icon: 'youtube', url: 'https://www.youtube.com/@cbtomelloso', label: 'YouTube' }
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 50);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
