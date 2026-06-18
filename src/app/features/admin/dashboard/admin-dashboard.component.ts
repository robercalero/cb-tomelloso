import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, finalize } from 'rxjs';
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

interface MigrateResult {
  message: string;
  total?: number;
  migrated?: number;
  errors?: number;
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

      <section class="tools-section">
        <h2>Herramientas</h2>
        <div class="tool-card">
          <div class="tool-card__info">
            <strong>Migrar imágenes de Instagram</strong>
            <span>Convierte las imágenes de Instagram a almacenamiento persistente en la base de datos.</span>
          </div>
          <button class="tool-btn" (click)="migrate()" [disabled]="migrating()">
            {{ migrating() ? 'Migrando…' : 'Migrar imágenes' }}
          </button>
          @if (migrateResult(); as r) {
            <div class="migrate-result" [class.migrate-result--ok]="r.errors === 0 || r.errors === undefined">
              <p>{{ r.message }}</p>
              @if (r.total !== undefined) {
                <small>Migradas: {{ r.migrated }} / Errores: {{ r.errors }} / Total: {{ r.total }}</small>
              }
            </div>
          }
        </div>
      </section>
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
    .tools-section { margin-top: 3rem; }
    .tools-section h2 { font-family: var(--font-heading); font-weight: 700; margin: 0 0 1rem; font-size: 1.2rem; }
    .tool-card {
      background: white; border-radius: 12px; padding: 1.5rem;
      display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .tool-card__info { flex: 1; min-width: 200px; }
    .tool-card__info strong { display: block; margin-bottom: 0.25rem; }
    .tool-card__info span { font-size: 0.85rem; color: var(--color-text-muted); }
    .tool-btn {
      background: #1a5276; color: white; border: none; border-radius: 8px;
      padding: 0.75rem 1.5rem; font-weight: 600; cursor: pointer;
      white-space: nowrap; transition: opacity 0.2s;
    }
    .tool-btn:hover:not(:disabled) { opacity: 0.9; }
    .tool-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .migrate-result {
      width: 100%; padding: 0.75rem 1rem; border-radius: 8px;
      background: #fff3cd; border: 1px solid #ffc107; font-size: 0.85rem;
    }
    .migrate-result--ok { background: #d4edda; border-color: #28a745; }
    .migrate-result p { margin: 0 0 0.25rem; }
    .migrate-result small { opacity: 0.7; }
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

  readonly migrating = signal(false);
  readonly migrateResult = signal<MigrateResult | null>(null);

  constructor() {
    this.title.setTitle(`Dashboard — ${environment.titleSuffix}`);
    this.loadStats();
  }

  migrate(): void {
    this.migrating.set(true);
    this.migrateResult.set(null);
    this.api.post<MigrateResult>('admin/migrate-instagram-images', {}).pipe(
      finalize(() => this.migrating.set(false)),
      catchError(() => {
        this.migrateResult.set({ message: 'Error al conectar con el servidor', total: 0, migrated: 0, errors: -1 });
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(r => {
      if (r) this.migrateResult.set(r);
    });
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
