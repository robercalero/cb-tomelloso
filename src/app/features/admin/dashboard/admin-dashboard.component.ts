import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';
import { Title } from '@angular/platform-browser';

interface DashboardStats {
  totalNews: number;
  pendingOrders: number;
  unreadMessages: number;
  totalActiveMembers: number;
  totalProducts: number;
  revenueThisMonth: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <div class="dashboard-grid">
        <div class="metric-card">
          <span class="metric-card__icon">📰</span>
          <div>
            <span class="metric-card__number">{{ stats().totalNews }}</span>
            <span class="metric-card__label">Noticias publicadas</span>
          </div>
        </div>
        <div class="metric-card metric-card--warning">
          <span class="metric-card__icon">📦</span>
          <div>
            <span class="metric-card__number">{{ stats().pendingOrders }}</span>
            <span class="metric-card__label">Pedidos pendientes</span>
          </div>
        </div>
        <div class="metric-card metric-card--success">
          <span class="metric-card__icon">💶</span>
          <div>
            <span class="metric-card__number">{{ stats().revenueThisMonth | currency:'EUR':'symbol':'1.2-2':'es' }}</span>
            <span class="metric-card__label">Ingresos este mes</span>
          </div>
        </div>
        <div class="metric-card metric-card--info">
          <span class="metric-card__icon">✉️</span>
          <div>
            <span class="metric-card__number">{{ stats().unreadMessages }}</span>
            <span class="metric-card__label">Mensajes sin leer</span>
          </div>
        </div>
        <div class="metric-card">
          <span class="metric-card__icon">🏅</span>
          <div>
            <span class="metric-card__number">{{ stats().totalActiveMembers }}</span>
            <span class="metric-card__label">Socios activos</span>
          </div>
        </div>
        <div class="metric-card">
          <span class="metric-card__icon">🛍️</span>
          <div>
            <span class="metric-card__number">{{ stats().totalProducts }}</span>
            <span class="metric-card__label">Productos activos</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .dashboard h1 { font-family: var(--font-heading); font-weight: 800; margin: 0 0 2rem; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
    .metric-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      display: flex; align-items: center; gap: 1rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .metric-card__icon { font-size: 2rem; }
    .metric-card__number { display: block; font-size: 1.8rem; font-weight: 800; line-height: 1; }
    .metric-card__label { font-size: 0.8rem; color: var(--color-text-muted); }
    .metric-card--warning .metric-card__number { color: #e67e22; }
    .metric-card--success .metric-card__number { color: #27ae60; }
    .metric-card--info .metric-card__number { color: #2980b9; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private title = inject(Title);

  readonly stats = signal<DashboardStats>({
    totalNews: 0, pendingOrders: 0, revenueThisMonth: 0, unreadMessages: 0,
    totalActiveMembers: 0, totalProducts: 0,
  });

  constructor() {
    this.title.setTitle(`Dashboard — ${environment.titleSuffix}`);
    this.loadStats();
  }

  private loadStats(): void {
    this.api.get<DashboardStats>('admin/stats').pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(s => {
      if (s) this.stats.set(s);
    });
  }
}
