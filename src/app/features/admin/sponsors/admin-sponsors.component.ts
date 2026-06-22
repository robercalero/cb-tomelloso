import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface Sponsor {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  tier: string;
  isActive: boolean;
  sortOrder: number;
}

@Component({
  selector: 'app-admin-sponsors',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Patrocinadores</h1>
        <a routerLink="/admin/patrocinadores/nuevo" class="btn btn--primary">Nuevo patrocinador</a>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Web</th>
              <th>Activo</th>
              <th>Orden</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (s of sponsors(); track s.id) {
              <tr>
                <td><img [src]="s.logoUrl" alt="" width="40" height="40" style="object-fit:contain;border-radius:4px;" /></td>
                <td>{{ s.name }}</td>
                <td>{{ s.tier }}</td>
                <td>{{ s.websiteUrl ? 'Sí' : '—' }}</td>
                <td>{{ s.isActive ? 'Sí' : 'No' }}</td>
                <td>{{ s.sortOrder }}</td>
                <td class="actions">
                  <a [routerLink]="['/admin/patrocinadores', s.id]" class="btn btn--sm" title="Editar">✏️</a>
                  @if (isAdmin()) {
                    <button class="btn btn--sm btn--danger" (click)="deleteSponsor(s.id)" title="Eliminar">🗑️</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="empty">No hay patrocinadores</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page__header h1 { font-family: var(--font-heading); font-weight: 800; margin: 0; }
    .table-wrapper { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; border-bottom: 1px solid #eee; }
    .table th { font-weight: 700; color: var(--color-text-muted); background: #fafafa; }
    .table tbody tr:hover { background: #f8f9fa; }
    .empty { text-align: center; color: var(--color-text-muted); padding: 2rem !important; }
    .actions { display: flex; gap: 0.25rem; }
    .btn { border: none; cursor: pointer; padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; }
    .btn--sm { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
    .btn--primary { background: var(--color-primary); color: white; }
    .btn--danger { background: #fee; color: #c0392b; }
    .btn--danger:hover { background: #fdd; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSponsorsComponent {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  readonly isAdmin = this.authService.isAdmin;

  readonly sponsors = signal<Sponsor[]>([]);

  constructor() {
    this.loadSponsors();
  }

  private loadSponsors(): void {
    this.api.get<Sponsor[]>('sponsors').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.sponsors.set(data));
  }

  deleteSponsor(id: number): void {
    if (!confirm('¿Eliminar este patrocinador?')) return;
    this.api.delete<void>(`sponsors/${id}`).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: () => this.sponsors.set(this.sponsors().filter(s => s.id !== id)) });
  }
}
