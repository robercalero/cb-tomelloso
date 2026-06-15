import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

const TIERS = ['principal', 'oro', 'plata', 'bronce'] as const;

@Component({
  selector: 'app-admin-sponsors-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="admin-form">
      <div class="admin-form__header">
        <a routerLink="/admin/patrocinadores" class="back-link">&larr; Volver</a>
        <h1>{{ editMode() ? 'Editar' : 'Nuevo' }} patrocinador</h1>
      </div>
      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else {
        <form (ngSubmit)="save()" class="form">
          <div class="form-group">
            <label for="name">Nombre</label>
            <input id="name" [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" required />
          </div>
          <div class="form-group">
            <label for="logoUrl">Logo URL</label>
            <input id="logoUrl" [ngModel]="logoUrl()" (ngModelChange)="logoUrl.set($event)" name="logoUrl" required />
          </div>
          <div class="form-group">
            <label for="websiteUrl">Web URL</label>
            <input id="websiteUrl" [ngModel]="websiteUrl()" (ngModelChange)="websiteUrl.set($event)" name="websiteUrl" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="tier">Categoría</label>
              <select id="tier" [ngModel]="tier()" (ngModelChange)="tier.set($event)" name="tier">
                @for (t of TIERS; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label for="sortOrder">Orden</label>
              <input id="sortOrder" type="number" [ngModel]="sortOrder()" (ngModelChange)="sortOrder.set($event)" name="sortOrder" />
            </div>
          </div>
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label><input type="checkbox" [ngModel]="isActive()" (ngModelChange)="isActive.set($event)" name="isActive" /> Activo</label>
          </div>
          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }
          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="saving()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button>
            <a routerLink="/admin/patrocinadores" class="btn-cancel">Cancelar</a>
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
    .form-group input[type="text"], .form-group input[type="number"], .form-group textarea, .form-group select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box; }
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
export class AdminSponsorsFormComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly name = signal('');
  readonly logoUrl = signal('');
  readonly websiteUrl = signal('');
  readonly tier = signal<string>('bronce');
  readonly sortOrder = signal<number>(99);
  readonly description = signal('');
  readonly isActive = signal(true);

  protected readonly TIERS = TIERS;
  private sponsorId: number | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.sponsorId = Number(id);
      this.editMode.set(true);
      this.loadSponsor();
    }
  }

  private loadSponsor(): void {
    if (!this.sponsorId) return;
    this.loading.set(true);
    this.api.get<any>(`sponsors/${this.sponsorId}`).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(s => {
      if (!s) { this.loading.set(false); this.error.set('Patrocinador no encontrado'); return; }
      this.name.set(s.name);
      this.logoUrl.set(s.logoUrl);
      this.websiteUrl.set(s.websiteUrl ?? '');
      this.tier.set(s.tier);
      this.sortOrder.set(s.sortOrder);
      this.description.set(s.description ?? '');
      this.isActive.set(s.isActive);
      this.loading.set(false);
    });
  }

  save(): void {
    if (this.saving()) return;
    if (!this.name() || !this.logoUrl()) { this.error.set('Completa los campos obligatorios'); return; }
    this.saving.set(true);
    this.error.set('');

    const body: Record<string, unknown> = {
      name: this.name(),
      logoUrl: this.logoUrl(),
      websiteUrl: this.websiteUrl() || undefined,
      tier: this.tier(),
      sortOrder: this.sortOrder(),
      description: this.description() || undefined,
      isActive: this.isActive(),
    };

    const request = this.editMode() && this.sponsorId
      ? this.api.patch<any>(`sponsors/${this.sponsorId}`, body)
      : this.api.post<any>('sponsors', body);

    request.pipe(
      catchError(() => { this.saving.set(false); this.error.set('Error al guardar'); return of(null); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => { if (result) this.router.navigate(['/admin/patrocinadores']); });
  }
}
