import { ChangeDetectionStrategy, Component, signal, computed, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  template: `
    @if (showBanner()) {
      <div class="pwa-banner" role="banner" aria-label="Instalar aplicación">
        <div class="pwa-banner__content">
          <img src="assets/icons/icon-72x72.svg" alt="CB Tomelloso" class="pwa-banner__icon" />
          <div class="pwa-banner__text">
            <strong>Instala la app del CB Tomelloso</strong>
            <span>Acceso rápido desde tu móvil</span>
          </div>
        </div>
        <div class="pwa-banner__actions">
          <button class="pwa-banner__btn pwa-banner__btn--install" (click)="install()">Instalar</button>
          <button class="pwa-banner__btn pwa-banner__btn--dismiss" (click)="dismiss()" aria-label="Cerrar">✕</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .pwa-banner {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--color-dark, #1a1a2e); color: white;
      padding: 0.75rem 1rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; z-index: 9999;
      box-shadow: 0 -2px 12px rgba(0,0,0,0.3);
    }
    .pwa-banner__content { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
    .pwa-banner__icon { width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0; }
    .pwa-banner__text { display: flex; flex-direction: column; }
    .pwa-banner__text strong { font-size: 0.85rem; }
    .pwa-banner__text span { font-size: 0.75rem; opacity: 0.8; }
    .pwa-banner__actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
    .pwa-banner__btn {
      border: none; border-radius: 6px; padding: 0.5rem 1rem;
      font-weight: 600; cursor: pointer; font-size: 0.8rem;
    }
    .pwa-banner__btn--install { background: #f39c12; color: white; }
    .pwa-banner__btn--dismiss {
      background: transparent; color: rgba(255,255,255,0.6);
      padding: 0.5rem; font-size: 1.1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaInstallBannerComponent implements OnInit {
  private deferredPrompt = signal<any>(null);
  private dismissed = signal(false);
  readonly showBanner = computed(() => this.deferredPrompt() !== null && !this.dismissed());
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt.set(e);
      });
      window.addEventListener('appinstalled', () => {
        this.deferredPrompt.set(null);
      });
    }
  }

  install(): void {
    const prompt = this.deferredPrompt();
    if (!prompt) return;
    prompt.prompt();
    prompt.userChoice.then(() => this.deferredPrompt.set(null));
  }

  dismiss(): void {
    this.dismissed.set(true);
    if (isPlatformBrowser(this.platformId)) {
      try { localStorage.setItem('pwa_banner_dismissed', Date.now().toString()); } catch {}
    }
  }
}
