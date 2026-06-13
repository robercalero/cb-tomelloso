import { ChangeDetectionStrategy, Component, inject, signal, effect, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { News } from '../../../models/news.model';

@Component({
  selector: 'app-admin-news-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="admin-form">
      <div class="admin-form__header">
        <a routerLink="/admin/noticias" class="back-link">&larr; Volver</a>
        <h1>{{ editMode() ? 'Editar' : 'Nueva' }} noticia</h1>
      </div>

      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else {
        <form (ngSubmit)="save()" class="news-form">
          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }
          @if (success()) {
            <div class="form-success">{{ success() }}</div>
          }

          <div class="form-group">
            <label for="title">Título <span class="required">*</span></label>
            <input id="title" [ngModel]="title()" (ngModelChange)="title.set($event)" name="title" required placeholder="Ej: Gran victoria del senior en Puertollano" />
          </div>

          <div class="form-group">
            <label for="slug">Slug <span class="required">*</span></label>
            <input id="slug" [ngModel]="slug()" (ngModelChange)="slug.set($event)" name="slug" placeholder="Se genera automáticamente desde el título" />
          </div>

          <div class="form-group">
            <label for="excerpt">Extracto <span class="required">*</span></label>
            <textarea id="excerpt" [ngModel]="excerpt()" (ngModelChange)="excerpt.set($event)" name="excerpt" rows="3" placeholder="Breve resumen de la noticia"></textarea>
          </div>

          <div class="form-group">
            <label for="content">Contenido <span class="required">*</span></label>
            <textarea id="content" [ngModel]="content()" (ngModelChange)="content.set($event)" name="content" rows="10" placeholder="Contenido completo de la noticia"></textarea>
          </div>

          <div class="form-group">
            <label for="category">Categoría</label>
            <select id="category" [ngModel]="category()" (ngModelChange)="category.set($event)" name="category">
              <option value="">Sin categoría</option>
              <option value="resultado">Resultado</option>
              <option value="club">Club</option>
              <option value="cantera">Cantera</option>
              <option value="evento">Evento</option>
              <option value="general">General</option>
            </select>
          </div>

          <div class="form-group">
            <label for="imageUrl">URL de imagen</label>
            <input id="imageUrl" [ngModel]="imageUrl()" (ngModelChange)="imageUrl.set($event)" name="imageUrl" placeholder="https://ejemplo.com/imagen.jpg" />
          </div>

          <div class="form-group">
            <label for="source">Fuente</label>
            <select id="source" [ngModel]="source()" (ngModelChange)="source.set($event)" name="source">
              <option value="">Sin fuente</option>
              <option value="web">Web</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter / X</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div class="form-group">
            <label for="sourceUrl">URL de fuente</label>
            <input id="sourceUrl" [ngModel]="sourceUrl()" (ngModelChange)="sourceUrl.set($event)" name="sourceUrl" placeholder="https://..." />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>
                <input type="checkbox" [ngModel]="isPublished()" (ngModelChange)="isPublished.set($event)" name="isPublished" />
                Publicado
              </label>
            </div>
            <div class="form-group">
              <label for="publishedAt">Fecha de publicación</label>
              <input id="publishedAt" type="datetime-local" [ngModel]="publishedAt()" (ngModelChange)="publishedAt.set($event)" name="publishedAt" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
            <a routerLink="/admin/noticias" class="btn-cancel">Cancelar</a>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .admin-form { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .admin-form__header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .admin-form__header h1 { font-family: var(--font-heading); font-weight: 800; margin: 0; }
    .back-link { color: var(--color-primary); text-decoration: none; font-weight: 600; }
    .loading { text-align: center; color: var(--color-text-muted); padding: 2rem; }
    .news-form { background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-card); }
    .form-error { background: #fde8e8; color: #c0392b; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; }
    .form-success { background: #eafaf1; color: #27ae60; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; }
    .required { color: #c0392b; }
    .form-group select {
      width: 100%; padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box; background: white;
    }
    .form-group select:focus { outline: none; border-color: var(--color-primary); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.35rem; }
    .form-group input[type="text"],
    .form-group textarea {
      width: 100%; padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box;
    }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--color-primary); }
    .form-group input[type="checkbox"] { margin-right: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-row .form-group label { display: flex; align-items: center; font-weight: 400; cursor: pointer; }
    .form-row .form-group input[type="datetime-local"] {
      width: 100%; padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 0.95rem; box-sizing: border-box;
    }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn-save {
      padding: 0.7rem 2rem; background: var(--color-primary);
      color: white; border: none; border-radius: var(--radius-md);
      font-weight: 600; cursor: pointer;
    }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel {
      padding: 0.7rem 2rem; border: 1px solid var(--color-border);
      border-radius: var(--radius-md); color: var(--color-text);
      text-decoration: none; text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsFormComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private titleService = inject(Title);

  readonly editMode = signal(false);
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly id = signal<number | null>(null);
  readonly title = signal('');
  readonly slug = signal('');
  readonly excerpt = signal('');
  readonly content = signal('');
  readonly category = signal('');
  readonly imageUrl = signal('');
  readonly source = signal('');
  readonly sourceUrl = signal('');
  readonly isPublished = signal(false);
  readonly publishedAt = signal('');

  private readonly newsSlug = this.route.snapshot.paramMap.get('slug');

  constructor() {
    if (this.newsSlug && this.newsSlug !== 'nueva') {
      this.editMode.set(true);
      this.titleService.setTitle('Editar Noticia — Panel Admin');
      this.loadNews();
    } else {
      this.titleService.setTitle('Nueva Noticia — Panel Admin');
    }

    effect(() => {
      const title = this.title();
      if (!this.editMode() && title && !this.slug()) {
        this.slug.set(this.slugify(title));
      }
    });
  }

  private slugify(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9áéíóúñü]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private loadNews(): void {
    this.loading.set(true);
    this.api.get<News>(`news/${this.newsSlug}`).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(n => {
      if (!n) {
        this.loading.set(false);
        this.editMode.set(false);
        this.error.set('Noticia no encontrada. Se creará una nueva.');
        return;
      }
      this.id.set(n.id);
      this.title.set(n.title);
      this.slug.set(n.slug);
      this.excerpt.set(n.excerpt ?? '');
      this.content.set(n.content ?? '');
      this.category.set(n.category ?? '');
      this.imageUrl.set(n.imageUrl ?? '');
      this.source.set(n.source ?? '');
      this.sourceUrl.set(n.sourceUrl ?? '');
      this.isPublished.set(n.isPublished);
      this.publishedAt.set(n.publishedAt ? this.formatForInput(n.publishedAt) : '');
      this.loading.set(false);
    });
  }

  private formatForInput(date: string): string {
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  save(): void {
    if (this.saving()) return;
    this.error.set('');
    this.success.set('');

    if (!this.title() || !this.slug() || !this.excerpt() || !this.content()) {
      this.error.set('Título, slug, extracto y contenido son obligatorios');
      return;
    }

    if (this.editMode() && !this.id()) {
      this.saving.set(false);
      this.error.set('Error interno: ID de noticia no disponible');
      return;
    }

    this.saving.set(true);

    const body: Record<string, unknown> = {
      title: this.title(),
      slug: this.slug(),
      excerpt: this.excerpt(),
      content: this.content(),
      category: this.category() || undefined,
      imageUrl: this.imageUrl() || undefined,
      source: this.source() || undefined,
      sourceUrl: this.sourceUrl() || undefined,
      isPublished: this.isPublished(),
      publishedAt: this.publishedAt() ? new Date(this.publishedAt()).toISOString() : undefined,
    };

    const request = this.editMode()
      ? this.api.patch<News>(`news/${this.id()}`, body)
      : this.api.post<News>('news', body);

    request.pipe(
      catchError((err) => {
        this.saving.set(false);
        const msg = err.error?.message || err.error?.error || err.message;
        const text = Array.isArray(msg) ? msg.join('. ') : msg;
        this.error.set(text || 'Error al guardar. Inténtalo de nuevo.');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      if (result) {
        this.success.set('Noticia guardada correctamente');
        setTimeout(() => this.router.navigate(['/admin/noticias']), 1200);
      }
    });
  }
}
