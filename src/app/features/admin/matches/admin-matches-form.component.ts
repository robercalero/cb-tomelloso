import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

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

interface Team {
  id: number;
  name: string;
  category: string;
}

const MATCH_STATUSES = ['scheduled', 'live', 'finished', 'postponed', 'cancelled'] as const;

const MATCH_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  live: 'En directo',
  finished: 'Finalizado',
  postponed: 'Aplazado',
  cancelled: 'Cancelado',
};

@Component({
  selector: 'app-admin-matches-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="admin-form">
      <div class="admin-form__header">
        <a routerLink="/admin/partidos" class="back-link">&larr; Volver</a>
        <h1>{{ editMode() ? 'Editar' : 'Nuevo' }} partido</h1>
      </div>

      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else {
        <form (ngSubmit)="save()" class="match-form">
          <div class="form-group">
            <label for="teamId">Equipo</label>
            <select id="teamId" [ngModel]="teamId()" (ngModelChange)="teamId.set($event)" name="teamId" required>
              <option value="">Seleccionar equipo...</option>
              @for (team of teams(); track team.id) {
                <option [value]="team.id">{{ team.name }} ({{ team.category }})</option>
              }
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="homeTeam">Local</label>
              <input id="homeTeam" [ngModel]="homeTeam()" (ngModelChange)="homeTeam.set($event)" name="homeTeam" required />
            </div>
            <div class="form-group">
              <label for="awayTeam">Visitante</label>
              <input id="awayTeam" [ngModel]="awayTeam()" (ngModelChange)="awayTeam.set($event)" name="awayTeam" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="matchDate">Fecha</label>
              <input id="matchDate" type="date" [ngModel]="matchDate()" (ngModelChange)="matchDate.set($event)" name="matchDate" required />
            </div>
            <div class="form-group">
              <label for="matchTime">Hora</label>
              <input id="matchTime" type="time" [ngModel]="matchTime()" (ngModelChange)="matchTime.set($event)" name="matchTime" required />
            </div>
          </div>

          <div class="form-group">
            <label for="competition">Competici&oacute;n</label>
            <input id="competition" [ngModel]="competition()" (ngModelChange)="competition.set($event)" name="competition" required />
          </div>

          <div class="form-group">
            <label for="venue">Lugar</label>
            <input id="venue" [ngModel]="venue()" (ngModelChange)="venue.set($event)" name="venue" required />
          </div>

          @if (status() === 'finished' || status() === 'live') {
            <div class="form-row">
              <div class="form-group">
                <label for="scoreHome">Puntos local</label>
                <input id="scoreHome" type="number" [ngModel]="scoreHome()" (ngModelChange)="scoreHome.set($event)" name="scoreHome" />
              </div>
              <div class="form-group">
                <label for="scoreAway">Puntos visitante</label>
                <input id="scoreAway" type="number" [ngModel]="scoreAway()" (ngModelChange)="scoreAway.set($event)" name="scoreAway" />
              </div>
            </div>
          }

          <div class="form-row">
            <div class="form-group">
              <label for="status">Estado</label>
              <select id="status" [ngModel]="status()" (ngModelChange)="status.set($event)" name="status">
                @for (s of MATCH_STATUSES; track s) {
                  <option [value]="s">{{ MATCH_STATUS_LABELS[s] }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [ngModel]="isHome()" (ngModelChange)="isHome.set($event)" name="isHome" />
                Juega en casa
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Notas</label>
            <textarea id="notes" [ngModel]="notes()" (ngModelChange)="notes.set($event)" name="notes" rows="3"></textarea>
          </div>

          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }

          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
            <a routerLink="/admin/partidos" class="btn-cancel">Cancelar</a>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .admin-form { max-width: 700px; margin: 0 auto; padding: 2rem; }
    .admin-form__header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .admin-form__header h1 { font-family: var(--font-heading); font-weight: 800; margin: 0; }
    .back-link { color: var(--color-primary); text-decoration: none; font-weight: 600; }
    .loading { text-align: center; color: var(--color-text-muted); padding: 2rem; }
    .match-form { background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-card); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.35rem; }
    .form-group input[type="text"], .form-group input[type="number"],
    .form-group input[type="date"], .form-group input[type="time"],
    .form-group textarea, .form-group select {
      width: 100%; padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box;
    }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--color-primary); }
    .form-group input[type="checkbox"] { margin-right: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-row .form-group label { display: flex; align-items: center; font-weight: 400; cursor: pointer; }
    .form-error { background: #fde8e8; color: #c0392b; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn-save { padding: 0.7rem 2rem; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
    .btn-save:disabled { opacity: 0.5; }
    .btn-cancel { padding: 0.7rem 2rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text); text-decoration: none; text-align: center; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMatchesFormComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly teamId = signal<number | null>(null);
  readonly homeTeam = signal('');
  readonly awayTeam = signal('');
  readonly matchDate = signal('');
  readonly matchTime = signal('');
  readonly competition = signal('');
  readonly venue = signal('');
  readonly scoreHome = signal<number | null>(null);
  readonly scoreAway = signal<number | null>(null);
  readonly status = signal<'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'>('scheduled');
  readonly isHome = signal(true);
  readonly notes = signal('');

  readonly teams = signal<Team[]>([]);

  protected readonly MATCH_STATUSES = MATCH_STATUSES;
  protected readonly MATCH_STATUS_LABELS = MATCH_STATUS_LABELS;

  private matchId: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.matchId = Number(id);
      this.editMode.set(true);
      this.loadMatch();
    }
    this.loadTeams();
  }

  private loadTeams(): void {
    this.api.get<Team[]>('teams').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.teams.set(data));
  }

  private loadMatch(): void {
    if (!this.matchId) return;
    this.loading.set(true);
    this.api.get<Match>(`matches/${this.matchId}`).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(m => {
      if (!m) { this.loading.set(false); this.error.set('Partido no encontrado'); return; }
      this.teamId.set(m.teamId);
      this.homeTeam.set(m.homeTeam);
      this.awayTeam.set(m.awayTeam);
      this.matchDate.set(m.matchDate);
      this.matchTime.set(m.matchTime);
      this.competition.set(m.competition);
      this.venue.set(m.venue);
      this.scoreHome.set(m.scoreHome ?? null);
      this.scoreAway.set(m.scoreAway ?? null);
      this.status.set(m.status);
      this.isHome.set(m.isHome);
      this.notes.set(m.notes ?? '');
      this.loading.set(false);
    });
  }

  save(): void {
    if (this.saving()) return;
    if (!this.teamId() || !this.homeTeam() || !this.awayTeam() || !this.matchDate() || !this.matchTime() || !this.competition() || !this.venue()) {
      this.error.set('Completa todos los campos obligatorios');
      return;
    }
    this.saving.set(true);
    this.error.set('');

    const body: Record<string, unknown> = {
      teamId: this.teamId(),
      homeTeam: this.homeTeam(),
      awayTeam: this.awayTeam(),
      matchDate: this.matchDate(),
      matchTime: this.matchTime(),
      competition: this.competition(),
      venue: this.venue(),
      scoreHome: this.scoreHome() ?? undefined,
      scoreAway: this.scoreAway() ?? undefined,
      status: this.status(),
      isHome: this.isHome(),
      notes: this.notes() || undefined,
    };

    const request = this.editMode() && this.matchId
      ? this.api.patch<Match>(`matches/${this.matchId}`, body)
      : this.api.post<Match>('matches', body);

    request.pipe(
      catchError(() => {
        this.saving.set(false);
        this.error.set('Error al guardar el partido');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      if (result) this.router.navigate(['/admin/partidos']);
    });
  }
}
