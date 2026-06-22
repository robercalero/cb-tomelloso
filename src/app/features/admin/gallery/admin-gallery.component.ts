import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

interface GalleryItem {
  id: number;
  title?: string;
  mediaType: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  season?: string;
  eventName?: string;
  takenAt?: string;
  isPublished: boolean;
  sortOrder: number;
}

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Galería</h1>
        <a routerLink="/admin/galeria/nueva" class="btn btn--primary">Nueva imagen</a>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Temporada</th>
              <th>Publicado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr>
                <td><img [src]="item.thumbnailUrl || item.url" alt="" width="60" height="40" style="object-fit:cover;border-radius:4px;" /></td>
                <td>{{ item.title || '—' }}</td>
                <td>{{ item.mediaType }}</td>
                <td>{{ item.season || '—' }}</td>
                <td>{{ item.isPublished ? 'Sí' : 'No' }}</td>
                <td class="actions">
                  <a [routerLink]="['/admin/galeria', item.id]" class="btn btn--sm" title="Editar">✏️</a>
                  <button class="btn btn--sm btn--danger" (click)="deleteItem(item.id)" title="Eliminar">🗑️</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="empty">No hay elementos en la galería</td></tr>
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
export class AdminGalleryComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  readonly items = signal<GalleryItem[]>([]);

  constructor() {
    this.loadItems();
  }

  private loadItems(): void {
    this.api.get<GalleryItem[]>('gallery').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.items.set(data));
  }

  deleteItem(id: number): void {
    if (!confirm('¿Eliminar este elemento?')) return;
    this.api.delete<void>(`gallery/${id}`).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: () => this.items.set(this.items().filter(i => i.id !== id)) });
  }
}
