import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

interface Team {
  id: number;
  name: string;
  category: string;
  season: string;
  coach?: string;
  assistantCoach?: string;
  isActive: boolean;
}

const TEAM_CATEGORIES = [
  'Senior Autonómica', 'Junior U19', 'Júnior', 'Cadete',
  'Infantil', 'Alevín', 'Benjamín', 'Minibasket',
] as const;

@Component({
  selector: 'app-admin-teams-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="admin-form">
      <div class="admin-form__header">
        <a routerLink="/admin/equipos" class="back-link">&larr; Volver</a>
        <h1>{{ editMode() ? 'Editar' : 'Nuevo' }} equipo</h1>
      </div>

      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else {
        <form (ngSubmit)="save()" class="team-form">
          <div class="form-group">
            <label for="name">Nombre</label>
            <input id="name" [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" required />
          </div>

          <div class="form-group">
            <label for="category">Categor&iacute;a</label>
            <select id="category" [ngModel]="category()" (ngModelChange)="category.set($event)" name="category" required>
              <option value="">Seleccionar categor&iacute;a...</option>
              @for (cat of TEAM_CATEGORIES; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="season">Temporada</label>
            <input id="season" [ngModel]="season()" (ngModelChange)="season.set($event)" name="season" required placeholder="2025/2026" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="coach">Entrenador</label>
              <input id="coach" [ngModel]="coach()" (ngModelChange)="coach.set($event)" name="coach" />
            </div>
            <div class="form-group">
              <label for="assistantCoach">Entrenador asistente</label>
              <input id="assistantCoach" [ngModel]="assistantCoach()" (ngModelChange)="assistantCoach.set($event)" name="assistantCoach" />
            </div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" [ngModel]="isActive()" (ngModelChange)="isActive.set($event)" name="isActive" />
              Activo
            </label>
          </div>

          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }

          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
            <a routerLink="/admin/equipos" class="btn-cancel">Cancelar</a>
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
    .team-form { background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-card); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.35rem; }
    .form-group input[type="text"], .form-group select {
      width: 100%; padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--color-primary); }
    .form-group input[type="checkbox"] { margin-right: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-error { background: #fde8e8; color: #c0392b; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn-save { padding: 0.7rem 2rem; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
    .btn-save:disabled { opacity: 0.5; }
    .btn-cancel { padding: 0.7rem 2rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text); text-decoration: none; text-align: center; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTeamsFormComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly name = signal('');
  readonly category = signal('');
  readonly season = signal('');
  readonly coach = signal('');
  readonly assistantCoach = signal('');
  readonly isActive = signal(true);

  protected readonly TEAM_CATEGORIES = TEAM_CATEGORIES;
  private teamId: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.teamId = Number(id);
      this.editMode.set(true);
      this.loadTeam();
    }
  }

  private loadTeam(): void {
    if (!this.teamId) return;
    this.loading.set(true);
    this.api.get<Team>(`teams/${this.teamId}`).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(t => {
      if (!t) { this.loading.set(false); this.error.set('Equipo no encontrado'); return; }
      this.name.set(t.name);
      this.category.set(t.category);
      this.season.set(t.season);
      this.coach.set(t.coach ?? '');
      this.assistantCoach.set(t.assistantCoach ?? '');
      this.isActive.set(t.isActive);
      this.loading.set(false);
    });
  }

  save(): void {
    if (this.saving()) return;
    if (!this.name() || !this.category() || !this.season()) {
      this.error.set('Nombre, categoría y temporada son obligatorios');
      return;
    }
    this.saving.set(true);
    this.error.set('');

    const body: Record<string, unknown> = {
      name: this.name(),
      category: this.category(),
      season: this.season(),
      coach: this.coach() || undefined,
      assistantCoach: this.assistantCoach() || undefined,
      isActive: this.isActive(),
    };

    const request = this.editMode() && this.teamId
      ? this.api.patch<Team>(`teams/${this.teamId}`, body)
      : this.api.post<Team>('teams', body);

    request.pipe(
      catchError(() => {
        this.saving.set(false);
        this.error.set('Error al guardar el equipo');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      if (result) this.router.navigate(['/admin/equipos']);
    });
  }
}
