import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-gallery-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="admin-form">
      <div class="admin-form__header">
        <a routerLink="/admin/galeria" class="back-link">&larr; Volver</a>
        <h1>{{ editMode() ? 'Editar' : 'Nueva' }} imagen</h1>
      </div>
      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else {
        <form (ngSubmit)="save()" class="form">
          <div class="form-group">
            <label for="title">Título</label>
            <input id="title" [ngModel]="title()" (ngModelChange)="title.set($event)" name="title" />
          </div>
          <div class="form-group">
            <label for="url">URL</label>
            <input id="url" [ngModel]="url()" (ngModelChange)="url.set($event)" name="url" required />
          </div>
          <div class="form-group">
            <label for="mediaType">Tipo</label>
            <select id="mediaType" [ngModel]="mediaType()" (ngModelChange)="mediaType.set($event)" name="mediaType">
              <option value="image">Imagen</option>
              <option value="video">Vídeo</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="season">Temporada</label>
              <input id="season" [ngModel]="season()" (ngModelChange)="season.set($event)" name="season" />
            </div>
            <div class="form-group">
              <label for="eventName">Evento</label>
              <input id="eventName" [ngModel]="eventName()" (ngModelChange)="eventName.set($event)" name="eventName" />
            </div>
          </div>
          <div class="form-group">
            <label><input type="checkbox" [ngModel]="isPublished()" (ngModelChange)="isPublished.set($event)" name="isPublished" /> Publicado</label>
          </div>
          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }
          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="saving()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button>
            <a routerLink="/admin/galeria" class="btn-cancel">Cancelar</a>
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
    .form-group input[type="text"], .form-group select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box; }
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
export class AdminGalleryFormComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly title = signal('');
  readonly url = signal('');
  readonly mediaType = signal<'image' | 'video'>('image');
  readonly season = signal('');
  readonly eventName = signal('');
  readonly isPublished = signal(true);

  private itemId: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      this.itemId = Number(id);
      this.editMode.set(true);
      this.loadItem();
    }
  }

  private loadItem(): void {
    if (!this.itemId) return;
    this.loading.set(true);
    this.api.get<any>(`gallery/${this.itemId}`).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(item => {
      if (!item) { this.loading.set(false); this.error.set('Elemento no encontrado'); return; }
      this.title.set(item.title ?? '');
      this.url.set(item.url);
      this.mediaType.set(item.mediaType);
      this.season.set(item.season ?? '');
      this.eventName.set(item.eventName ?? '');
      this.isPublished.set(item.isPublished);
      this.loading.set(false);
    });
  }

  save(): void {
    if (this.saving()) return;
    if (!this.url()) { this.error.set('La URL es obligatoria'); return; }
    this.saving.set(true);
    this.error.set('');

    const body = {
      title: this.title() || undefined,
      url: this.url(),
      mediaType: this.mediaType(),
      season: this.season() || undefined,
      eventName: this.eventName() || undefined,
      isPublished: this.isPublished(),
    };

    const request = this.editMode() && this.itemId
      ? this.api.patch<any>(`gallery/${this.itemId}`, body)
      : this.api.post<any>('gallery', body);

    request.pipe(
      catchError(() => { this.saving.set(false); this.error.set('Error al guardar'); return of(null); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => { if (result) this.router.navigate(['/admin/galeria']); });
  }
}
