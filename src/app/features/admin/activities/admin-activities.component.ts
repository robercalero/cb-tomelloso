import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface Activity {
  id: number;
  title: string;
  activityType: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  isPublished: boolean;
}

@Component({
  selector: 'app-admin-activities',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Actividades</h1>
        <a routerLink="/admin/actividades/nueva" class="btn btn--primary">Nueva actividad</a>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Lugar</th>
              <th>Publicado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (a of activities(); track a.id) {
              <tr>
                <td>{{ a.title }}</td>
                <td>{{ a.activityType }}</td>
                <td>{{ a.startDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ a.endDate ? (a.endDate | date:'dd/MM/yyyy') : '—' }}</td>
                <td>{{ a.venue || '—' }}</td>
                <td>{{ a.isPublished ? 'Sí' : 'No' }}</td>
                <td class="actions">
                  <a [routerLink]="['/admin/actividades', a.id]" class="btn btn--sm" title="Editar">✏️</a>
                  @if (isAdmin()) {
                    <button class="btn btn--sm btn--danger" (click)="deleteActivity(a.id)" title="Eliminar">🗑️</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="empty">No hay actividades registradas</td></tr>
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
export class AdminActivitiesComponent {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  readonly isAdmin = this.authService.isAdmin;

  readonly activities = signal<Activity[]>([]);

  constructor() {
    this.loadActivities();
  }

  private loadActivities(): void {
    this.api.get<Activity[]>('activities').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.activities.set(data));
  }

  deleteActivity(id: number): void {
    if (!confirm('¿Eliminar esta actividad?')) return;
    this.api.delete<void>(`activities/${id}`).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: () => this.activities.set(this.activities().filter(a => a.id !== id)) });
  }
}
