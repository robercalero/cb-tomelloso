import { ChangeDetectionStrategy, Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { News, NewsListResponse } from '../../../models/news.model';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Noticias <span class="page__count">({{ total() }})</span></h1>
        <a routerLink="/admin/noticias/nueva" class="btn btn--primary">Nueva noticia</a>
      </div>

      <div class="page__filters">
        <select [value]="selectedCategory()" (change)="selectedCategory.set($any($event.target).value)">
          <option value="">Todas las categorías</option>
          @for (cat of categories(); track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (item of filteredNews(); track item.id) {
              <tr>
                <td>{{ item.title }}</td>
                <td>{{ item.category }}</td>
                <td>
                  @if (item.isPublished) {
                    <span class="status-badge status-badge--active">Publicado</span>
                  } @else {
                    <span class="status-badge status-badge--inactive">Borrador</span>
                  }
                </td>
                <td>{{ item.publishedAt | date:'short' }}</td>
                <td class="actions">
                  <a [routerLink]="['/admin/noticias', item.slug]" class="btn btn--sm">Editar</a>
                  <button class="btn btn--sm" (click)="togglePublish(item)">
                    {{ item.isPublished ? 'Despublicar' : 'Publicar' }}
                  </button>
                  @if (isAdmin()) {
                    <button class="btn btn--sm btn--danger" (click)="deleteNews(item)">Eliminar</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty">No hay noticias</td>
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
    .page__count { font-size: 0.8rem; font-weight: 400; color: var(--color-text-muted); }
    .page__filters { margin-bottom: 1rem; }
    .page__filters select {
      padding: 0.5rem 0.75rem; border: 1px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 0.9rem; background: white;
    }
    .table-wrapper { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; border-bottom: 1px solid #eee; }
    .table th { font-weight: 700; color: var(--color-text-muted); background: #fafafa; }
    .table tbody tr:hover { background: #f8f9fa; }
    .empty { text-align: center; color: var(--color-text-muted); padding: 2rem !important; }
    .actions { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .btn {
      border: none; cursor: pointer; padding: 0.35rem 0.6rem; border-radius: 6px;
      font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center;
      background: #f0f0f0; color: var(--color-text);
    }
    .btn--primary { background: var(--color-primary); color: white; }
    .btn--sm { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
    .btn--danger { background: #fee; color: #c0392b; }
    .btn--danger:hover { background: #fdd; }
    .status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
    .status-badge--active { background: #eafaf1; color: #27ae60; }
    .status-badge--inactive { background: #fdedec; color: #c0392b; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsComponent {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private titleService = inject(Title);

  readonly isAdmin = this.authService.isAdmin;

  readonly news = signal<News[]>([]);
  readonly total = signal(0);
  readonly selectedCategory = signal<string>('');

  readonly categories = computed(() => {
    const all = this.news();
    return [...new Set(all.map(n => n.category).filter(Boolean))];
  });

  readonly filteredNews = computed(() => {
    const category = this.selectedCategory();
    if (!category) return this.news();
    return this.news().filter(n => n.category === category);
  });

  constructor() {
    this.titleService.setTitle('Noticias — Panel Admin');
    this.loadNews();
  }

  private loadNews(): void {
    this.api.get<NewsListResponse>('news', { page: 1, limit: 50, isPublished: 'all' }).pipe(
      catchError(() => of({ data: [], total: 0, page: 1, limit: 50 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      this.news.set(res.data);
      this.total.set(res.total);
    });
  }

  togglePublish(item: News): void {
    this.api.patch<News>(`news/${item.id}`, { isPublished: !item.isPublished }).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadNews());
  }

  deleteNews(item: News): void {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    this.api.delete<void>(`news/${item.id}`).pipe(
      catchError(() => of(undefined)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadNews());
  }
}
