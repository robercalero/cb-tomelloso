import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product, ProductCategory } from '../../../../models/shop.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    @if (!authService.isEditor()) {
      <div class="admin-access-denied">
        <p>Necesitas permisos de administrador o editor.</p>
        <a routerLink="/">Volver al inicio</a>
      </div>
    } @else {
      <div class="admin-form">
        <div class="admin-form__header">
          <a routerLink="/admin/tienda" class="back-link">&larr; Volver</a>
          <h1>{{ isEdit() ? 'Editar' : 'Nuevo' }} producto</h1>
        </div>

        @if (loading()) {
          <p class="loading">Cargando producto...</p>
        } @else {
          <form (ngSubmit)="save()" class="product-form">
            @if (error()) {
              <div class="form-error">{{ error() }}</div>
            }

            <div class="form-group">
              <label for="name">Nombre</label>
              <input id="name" [(ngModel)]="formData.name" name="name" required />
            </div>

            <div class="form-group">
              <label for="slug">Slug</label>
              <input id="slug" [(ngModel)]="formData.slug" name="slug" required />
            </div>

            <div class="form-group">
              <label for="categoryId">Categor&iacute;a</label>
              <select id="categoryId" [(ngModel)]="formData.categoryId" name="categoryId">
                <option [value]="null">Sin categor&iacute;a</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label for="description">Descripci&oacute;n</label>
              <textarea id="description" [(ngModel)]="formData.description"
                        name="description" rows="4"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="price">Precio (&euro;)</label>
                <input id="price" type="number" step="0.01"
                       [(ngModel)]="formData.price" name="price" required />
              </div>
              <div class="form-group">
                <label for="comparePrice">Precio original / tachado (&euro;)</label>
                <input id="comparePrice" type="number" step="0.01"
                       [(ngModel)]="formData.comparePrice" name="comparePrice" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="stock">Stock</label>
                <input id="stock" type="number" [(ngModel)]="formData.stock" name="stock" />
              </div>
              <div class="form-group">
                <label for="sku">SKU</label>
                <input id="sku" [(ngModel)]="formData.sku" name="sku" />
              </div>
            </div>

            <div class="form-group">
              <label for="season">Temporada</label>
              <input id="season" [(ngModel)]="formData.season" name="season" placeholder="ej: 2025/26" />
            </div>

            <div class="form-group">
              <label>Im&aacute;genes (URLs separadas por coma)</label>
              <input id="images" [(ngModel)]="formData.imagesInput" name="imagesInput" placeholder="https://ejemplo.com/img1.jpg" />
            </div>

            <div class="form-group">
              <label>Tallas</label>
              <div class="chips-group">
                @for (size of AVAILABLE_SIZES; track size) {
                  <button type="button" class="chip"
                          [class.chip--active]="formData.sizes.includes(size)"
                          (click)="toggleSize(size)">
                    {{ size }}
                  </button>
                }
              </div>
            </div>

            <div class="form-group">
              <label>Colores</label>
              <div class="colors-list">
                @for (color of formData.colors; track $index) {
                  <div class="color-item">
                    <span class="color-swatch" [style.background]="color.hex"></span>
                    <span>{{ color.name }}</span>
                    <button type="button" class="btn-remove-sm" (click)="removeColor($index)">&times;</button>
                  </div>
                }
              </div>
              <div class="color-form">
                <input [(ngModel)]="formData.newColorName" name="newColorName" placeholder="Nombre del color" class="color-input" />
                <input type="color" [(ngModel)]="formData.newColorHex" name="newColorHex" class="color-picker" />
                <button type="button" class="btn-add" (click)="addColor()">A&ntilde;adir</button>
              </div>
            </div>

            <div class="form-group">
              <label>Etiquetas (separadas por coma)</label>
              <input id="tags" [(ngModel)]="formData.tagsInput" name="tagsInput" placeholder="ej: nueva-temporada, oferta" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive" />
                  Activo
                </label>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="formData.isFeatured" name="isFeatured" />
                  Destacado
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save" [disabled]="isSaving()">
                {{ isSaving() ? 'Guardando...' : 'Guardar' }}
              </button>
              <a routerLink="/admin/tienda" class="btn-cancel">Cancelar</a>
            </div>
          </form>
        }
      </div>
    }
  `,
  styles: [`
    .admin-form { max-width: 700px; margin: 0 auto; padding: 2rem; }
    .admin-form__header {
      display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
    }
    .admin-form__header h1 {
      font-family: var(--font-heading); font-weight: 800; margin: 0;
    }
    .back-link { color: var(--color-primary); text-decoration: none; font-weight: 600; }
    .loading { text-align: center; color: var(--color-text-muted); padding: 2rem; }
    .product-form { background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-card); }
    .form-error { background: #fde8e8; color: #c0392b; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block; font-weight: 600; font-size: 0.85rem;
      margin-bottom: 0.35rem;
    }
    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group textarea,
    .form-group select {
      width: 100%; padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 0.95rem;
    }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none; border-color: var(--color-primary);
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-row .form-group label {
      display: flex; align-items: center; gap: 0.5rem;
      font-weight: 400; cursor: pointer;
    }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn-save {
      padding: 0.7rem 2rem; background: var(--color-primary);
      color: white; border: none; border-radius: var(--radius-md);
      font-weight: 600; cursor: pointer;
    }
    .btn-save:disabled { opacity: 0.5; }
    .btn-cancel {
      padding: 0.7rem 2rem; border: 1px solid var(--color-border);
      border-radius: var(--radius-md); color: var(--color-text);
      text-decoration: none; text-align: center;
    }
    .admin-access-denied {
      text-align: center; padding: 4rem 2rem; color: var(--color-text-muted);
    }
    .chips-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .chip {
      padding: 0.35rem 0.75rem; border: 1px solid var(--color-border);
      border-radius: 20px; background: white; cursor: pointer;
      font-size: 0.85rem; font-weight: 600; transition: all 150ms ease;
    }
    .chip--active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .colors-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
    .color-item {
      display: flex; align-items: center; gap: 0.35rem;
      padding: 0.25rem 0.5rem; border: 1px solid var(--color-border);
      border-radius: 6px; font-size: 0.8rem;
    }
    .color-swatch { width: 16px; height: 16px; border-radius: 50%; border: 1px solid #ddd; }
    .color-form { display: flex; gap: 0.5rem; align-items: center; }
    .color-input { flex: 1; }
    .color-picker { width: 40px; height: 36px; padding: 2px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; }
    .btn-remove-sm { background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 1rem; padding: 0; line-height: 1; }
    .btn-add { padding: 0.35rem 0.75rem; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem; font-weight: 600; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);
  private title = inject(Title);

  readonly isEdit = signal(false);
  readonly isSaving = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly categories = signal<ProductCategory[]>([]);

  protected readonly AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  private productSlug: string | null = null;
  private productId: number | null = null;

  formData = {
    name: '',
    slug: '',
    description: '',
    categoryId: null as number | null,
    price: 0,
    comparePrice: null as number | null,
    stock: 0,
    sku: '',
    season: '',
    imagesInput: '',
    sizes: [] as string[],
    colors: [] as { name: string; hex: string }[],
    tagsInput: '',
    isActive: true,
    isFeatured: false,
    newColorName: '',
    newColorHex: '#cc0000',
  };

  toggleSize(size: string): void {
    const idx = this.formData.sizes.indexOf(size);
    if (idx >= 0) {
      this.formData.sizes.splice(idx, 1);
    } else {
      this.formData.sizes.push(size);
    }
  }

  addColor(): void {
    const name = this.formData.newColorName.trim();
    if (!name) return;
    this.formData.colors.push({ name, hex: this.formData.newColorHex });
    this.formData.newColorName = '';
    this.formData.newColorHex = '#cc0000';
  }

  removeColor(index: number): void {
    this.formData.colors.splice(index, 1);
  }

  constructor() {
    this.title.setTitle(`Admin productos — ${environment.titleSuffix}`);
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug && slug !== 'nuevo') {
      this.productSlug = slug;
      this.isEdit.set(true);
      this.loadProduct();
    }
    this.loadCategories();
  }

  private loadProduct(): void {
    if (!this.productSlug) return;
    this.loading.set(true);
    this.api.get<Product>(`shop/products/${this.productSlug}`).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(p => {
      if (!p) { this.loading.set(false); this.error.set('Producto no encontrado'); return; }
      this.productId = p.id;
      this.formData.name = p.name;
      this.formData.slug = p.slug;
      this.formData.description = p.description ?? '';
      this.formData.categoryId = p.categoryId;
      this.formData.price = p.price;
      this.formData.comparePrice = p.comparePrice ?? null;
      this.formData.stock = p.stock;
      this.formData.sku = p.sku ?? '';
      this.formData.season = p.season ?? '';
      this.formData.imagesInput = (p.images ?? []).join(', ');
      this.formData.sizes = [...(p.sizes ?? [])];
      this.formData.colors = [...(p.colors ?? []).map(c => ({ ...c }))];
      this.formData.tagsInput = (p.tags ?? []).join(', ');
      this.formData.isActive = p.isActive;
      this.formData.isFeatured = p.isFeatured;
      this.loading.set(false);
    });
  }

  private loadCategories(): void {
    this.api.get<ProductCategory[]>('shop/categories').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(cats => this.categories.set(cats));
  }

  save(): void {
    if (this.isSaving()) return;
    this.error.set('');

    if (!this.formData.name || !this.formData.slug) {
      this.error.set('Nombre y slug son obligatorios');
      return;
    }

    this.isSaving.set(true);

    const images = this.formData.imagesInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const tags = this.formData.tagsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const body: Record<string, unknown> = {
      name: this.formData.name,
      slug: this.formData.slug,
      description: this.formData.description || undefined,
      categoryId: this.formData.categoryId || undefined,
      price: this.formData.price,
      comparePrice: this.formData.comparePrice || undefined,
      stock: this.formData.stock,
      sku: this.formData.sku || undefined,
      season: this.formData.season || undefined,
      images: images.length > 0 ? images : undefined,
      sizes: this.formData.sizes.length > 0 ? this.formData.sizes : undefined,
      colors: this.formData.colors.length > 0 ? this.formData.colors : undefined,
      tags: tags.length > 0 ? tags : undefined,
      isActive: this.formData.isActive,
      isFeatured: this.formData.isFeatured,
    };

    const request = this.isEdit() && this.productId
      ? this.api.patch<Product>(`shop/products/${this.productId}`, body)
      : this.api.post<Product>('shop/products', body);

    request.pipe(
      catchError(() => {
        this.isSaving.set(false);
        this.error.set('Error al guardar el producto');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      if (result) this.router.navigate(['/admin/tienda']);
    });
  }
}
