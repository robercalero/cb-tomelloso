import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <nav class="admin-sidebar">
        <div class="admin-sidebar__brand">
          <span class="admin-sidebar__logo">CB Tomelloso</span>
          <span class="admin-sidebar__subtitle">Panel Admin</span>
        </div>
        <ul class="admin-sidebar__menu">
          <li><a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a></li>
          <li><a routerLink="/admin/noticias" routerLinkActive="active">Noticias</a></li>
          <li><a routerLink="/admin/partidos" routerLinkActive="active">Partidos</a></li>
          <li><a routerLink="/admin/equipos" routerLinkActive="active">Equipos</a></li>
          <li><a routerLink="/admin/tienda" routerLinkActive="active">Tienda</a></li>
          <li>
            <a routerLink="/admin/pedidos" routerLinkActive="active">
              Pedidos @if (pendingOrdersCount() > 0) { <span class="badge">{{ pendingOrdersCount() }}</span> }
            </a>
          </li>
          <li>
            <a routerLink="/admin/mensajes" routerLinkActive="active">
              Mensajes @if (unreadMessagesCount() > 0) { <span class="badge">{{ unreadMessagesCount() }}</span> }
            </a>
          </li>
          <li><a routerLink="/admin/socios" routerLinkActive="active">Socios</a></li>
          <li><a routerLink="/" routerLinkActive="active">Volver a la web</a></li>
        </ul>
        <div class="admin-sidebar__user">
          <span class="admin-sidebar__user-name">{{ authService.currentUser()?.name }}</span>
          <span class="admin-sidebar__user-role">{{ authService.currentUser()?.role }}</span>
          <button class="admin-sidebar__logout" (click)="logout()">Salir</button>
        </div>
      </nav>
      <main class="admin-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .admin-sidebar {
      width: 240px; background: #1a1a2e; color: white;
      display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh;
    }
    .admin-sidebar__brand { padding: 1.5rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .admin-sidebar__logo { display: block; font-weight: 800; font-size: 1.1rem; }
    .admin-sidebar__subtitle { font-size: 0.75rem; opacity: 0.6; }
    .admin-sidebar__menu { list-style: none; padding: 0.5rem 0; margin: 0; flex: 1; }
    .admin-sidebar__menu li a {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.7rem 1rem; color: rgba(255,255,255,0.7);
      text-decoration: none; font-size: 0.9rem; transition: 0.15s;
    }
    .admin-sidebar__menu li a:hover { background: rgba(255,255,255,0.05); color: white; }
    .admin-sidebar__menu li a.active { background: rgba(255,255,255,0.1); color: #f39c12; font-weight: 600; }
    .badge {
      background: #e74c3c; color: white; font-size: 0.7rem;
      padding: 0.1rem 0.45rem; border-radius: 10px; font-weight: 700;
    }
    .admin-sidebar__user {
      padding: 1rem; border-top: 1px solid rgba(255,255,255,0.1);
      display: flex; flex-direction: column; gap: 0.25rem;
    }
    .admin-sidebar__user-name { font-size: 0.85rem; font-weight: 600; }
    .admin-sidebar__user-role {
      font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
      background: rgba(255,255,255,0.1); padding: 0.15rem 0.5rem;
      border-radius: 4px; align-self: flex-start;
    }
    .admin-sidebar__logout {
      margin-top: 0.5rem; background: transparent; border: 1px solid rgba(255,255,255,0.2);
      color: white; padding: 0.3rem 0.75rem; border-radius: 4px; cursor: pointer;
    }
    .admin-content { flex: 1; background: #f4f6f9; overflow-y: auto; }
    @media (max-width: 768px) {
      .admin-layout { flex-direction: column; }
      .admin-sidebar { width: 100%; height: auto; position: static; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  readonly authService = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  readonly pendingOrdersCount = signal(0);
  readonly unreadMessagesCount = signal(0);

  constructor() {
    this.api.get<{ orders: { status: string }[]; total: number }>('shop/orders').pipe(
      catchError(() => of({ orders: [], total: 0 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(r => {
      const pending = r.orders.filter(o => o.status === 'pending').length;
      this.pendingOrdersCount.set(pending);
    });

    this.api.get<{ id: number; isRead: boolean }[]>('contact', { isRead: 'false' }).pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(messages => this.unreadMessagesCount.set(messages.length));
  }

  logout(): void {
    this.authService.logout().pipe(
      catchError(() => of(null)),
    ).subscribe(() => this.router.navigate(['/']));
  }
}
