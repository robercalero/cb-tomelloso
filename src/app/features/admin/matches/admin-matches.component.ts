import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

interface Match {
  id: number;
  teamId: number;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  matchTime: string;
  competition: string;
  venue: string;
  isHome: boolean;
  scoreHome?: number;
  scoreAway?: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  notes?: string;
  team?: { id: number; name: string; category: string };
}

@Component({
  selector: 'app-admin-matches',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Partidos</h1>
        <a routerLink="/admin/partidos/nuevo" class="btn btn--primary">Nuevo partido</a>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Competición</th>
              <th>Equipo</th>
              <th>Local</th>
              <th>Visitante</th>
              <th>Resultado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (match of matches(); track match.id) {
              <tr>
                <td>{{ match.matchDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ match.competition }}</td>
                <td>{{ match.team?.name ?? '—' }}</td>
                <td>{{ match.homeTeam }}</td>
                <td>{{ match.awayTeam }}</td>
                <td>
                  @if (match.scoreHome !== undefined && match.scoreAway !== undefined) {
                    {{ match.scoreHome }}–{{ match.scoreAway }}
                  } @else {
                    —
                  }
                </td>
                <td>
                  <span class="status-badge" [class]="'status-badge--' + match.status">
                    {{ match.status }}
                  </span>
                </td>
                <td class="actions">
                  <a [routerLink]="['/admin/partidos', match.id]" class="btn btn--sm" title="Editar">✏️</a>
                  @if (isAdmin()) {
                    <button class="btn btn--sm btn--danger" (click)="deleteMatch(match.id)" title="Eliminar">🗑️</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty">No hay partidos registrados</td>
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
    .status-badge--scheduled { background: #eaf2f8; color: #2980b9; }
    .status-badge--live { background: #fef9e7; color: #e67e22; }
    .status-badge--finished { background: #eafaf1; color: #27ae60; }
    .status-badge--postponed { background: #f5eef8; color: #8e44ad; }
    .status-badge--cancelled { background: #fdedec; color: #c0392b; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMatchesComponent {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  readonly isAdmin = this.authService.isAdmin;

  readonly matches = signal<Match[]>([]);

  constructor() {
    this.loadMatches();
  }

  private loadMatches(): void {
    this.api.get<Match[]>('matches').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => {
      this.matches.set(data.sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()));
    });
  }

  deleteMatch(id: number): void {
    if (!confirm('¿Eliminar este partido?')) return;
    this.api.delete<void>(`matches/${id}`).pipe(
      catchError(() => of(undefined)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.matches.set(this.matches().filter(m => m.id !== id));
    });
  }
}
