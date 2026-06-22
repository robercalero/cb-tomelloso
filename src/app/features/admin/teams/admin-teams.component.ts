import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface Team {
  id: number;
  name: string;
  category: string;
  season: string;
  coach?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-teams',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Equipos</h1>
        <a routerLink="/admin/equipos/nuevo" class="btn btn--primary">Nuevo equipo</a>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Temporada</th>
              <th>Entrenador</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (team of teams(); track team.id) {
              <tr>
                <td>{{ team.name }}</td>
                <td>{{ team.category }}</td>
                <td>{{ team.season }}</td>
                <td>{{ team.coach ?? '—' }}</td>
                <td>
                  @if (team.isActive) {
                    <span class="status-badge status-badge--active">Activo</span>
                  } @else {
                    <span class="status-badge status-badge--inactive">Inactivo</span>
                  }
                </td>
                <td class="actions">
                  <a [routerLink]="['/admin/equipos', team.id]" class="btn btn--sm" title="Editar">✏️</a>
                  @if (isAdmin()) {
                    <button class="btn btn--sm btn--danger" (click)="deleteTeam(team.id)" title="Eliminar">🗑️</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty">No hay equipos registrados</td>
              </tr>
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
    .status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
    .status-badge--active { background: #eafaf1; color: #27ae60; }
    .status-badge--inactive { background: #fdedec; color: #c0392b; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTeamsComponent {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  readonly isAdmin = this.authService.isAdmin;

  readonly teams = signal<Team[]>([]);

  constructor() {
    this.loadTeams();
  }

  private loadTeams(): void {
    this.api.get<Team[]>('teams').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.teams.set(data));
  }

  deleteTeam(id: number): void {
    if (!confirm('¿Eliminar este equipo?')) return;
    this.api.delete<void>(`teams/${id}`).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => this.teams.set(this.teams().filter(t => t.id !== id)),
    });
  }
}
