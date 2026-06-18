import { ChangeDetectionStrategy, Component, inject, DestroyRef, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartSidebarComponent } from './shared/components/cart-sidebar/cart-sidebar.component';
import { PwaInstallBannerComponent } from './shared/components/pwa-install-banner/pwa-install-banner.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { AuthService } from './core/services/auth.service';
import { KeepAliveService } from './core/services/keep-alive.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CartSidebarComponent, PwaInstallBannerComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private authService = inject(AuthService);
  private keepAlive = inject(KeepAliveService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.keepAlive.start();
    this.authService.sessionCleared$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
