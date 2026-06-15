import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

const ACTIVITY_TYPES = ['torneo', 'escuela', 'evento', 'copa', 'amistoso', 'otro'] as const;

@Component({
  selector: 'app-admin-activities-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="admin-form">
      <div class="admin-form__header">
        <a routerLink="/admin/actividades" class="back-link">&larr; Volver</a>
        <h1>{{ editMode() ? 'Editar' : 'Nueva' }} actividad</h1>
      </div>
      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else {
        <form (ngSubmit)="save()" class="form">
          <div class="form-group">
            <label for="title">Título</label>
            <input id="title" [ngModel]="title()" (ngModelChange)="title.set($event)" name="title" required />
          </div>
          <div class="form-group">
            <label for="activityType">Tipo</label>
            <select id="activityType" [ngModel]="activityType()" (ngModelChange)="activityType.set($event)" name="activityType">
              @for (t of ACTIVITY_TYPES; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Fecha inicio</label>
              <input id="startDate" type="date" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)" name="startDate" required />
            </div>
            <div class="form-group">
              <label for="endDate">Fecha fin</label>
              <input id="endDate" type="date" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)" name="endDate" />
            </div>
          </div>
          <div class="form-group">
            <label for="venue">Lugar</label>
            <input id="venue" [ngModel]="venue()" (ngModelChange)="venue.set($event)" name="venue" />
          </div>
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label><input type="checkbox" [ngModel]="isPublished()" (ngModelChange)="isPublished.set($event)" name="isPublished" /> Publicado</label>
          </div>
          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }
          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="saving()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button>
            <a routerLink="/admin/actividades" class="btn-cancel">Cancelar</a>
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
    .form { background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-card); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.35rem; }
    .form-group input[type="text"], .form-group input[type="date"], .form-group textarea, .form-group select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--color-primary); }
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
export class AdminActivitiesFormComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly title = signal('');
  readonly activityType = signal<string>('otro');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly venue = signal('');
  readonly description = signal('');
  readonly isPublished = signal(true);

  protected readonly ACTIVITY_TYPES = ACTIVITY_TYPES;
  private activityId: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      this.activityId = Number(id);
      this.editMode.set(true);
      this.loadActivity();
    }
  }

  private loadActivity(): void {
    if (!this.activityId) return;
    this.loading.set(true);
    this.api.get<any>(`activities/${this.activityId}`).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(a => {
      if (!a) { this.loading.set(false); this.error.set('Actividad no encontrada'); return; }
      this.title.set(a.title);
      this.activityType.set(a.activityType);
      this.startDate.set(a.startDate);
      this.endDate.set(a.endDate ?? '');
      this.venue.set(a.venue ?? '');
      this.description.set(a.description ?? '');
      this.isPublished.set(a.isPublished);
      this.loading.set(false);
    });
  }

  save(): void {
    if (this.saving()) return;
    if (!this.title() || !this.startDate()) { this.error.set('Completa los campos obligatorios'); return; }
    this.saving.set(true);
    this.error.set('');

    const body: Record<string, unknown> = {
      title: this.title(),
      activityType: this.activityType(),
      startDate: this.startDate(),
      endDate: this.endDate() || undefined,
      venue: this.venue() || undefined,
      description: this.description() || undefined,
      isPublished: this.isPublished(),
    };

    const request = this.editMode() && this.activityId
      ? this.api.patch<any>(`activities/${this.activityId}`, body)
      : this.api.post<any>('activities', body);

    request.pipe(
      catchError(() => { this.saving.set(false); this.error.set('Error al guardar'); return of(null); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => { if (result) this.router.navigate(['/admin/actividades']); });
  }
}
