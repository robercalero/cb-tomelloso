import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap, debounceTime, tap, catchError } from 'rxjs/operators';
import { Title, Meta } from '@angular/platform-browser';
import { ShopService } from '../../../../core/services/shop.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { Product } from '../../../../models/shop.model';
import { CartStore } from '../../../../core/services/cart.store';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-shop-home',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <section class="shop">
      <div class="shop__header">
        <h1 class="shop__title">Tienda Oficial CB Tomelloso</h1>
        <p class="shop__subtitle">Camisetas, equipaciones y merchandising oficial del club</p>
      </div>

      <div class="shop__filters">
        <div class="filter-search">
          <input type="text"
                 placeholder="Buscar productos..."
                 [value]="searchQuery()"
                 (input)="onSearch($event)"
                 class="filter-search__input" />
        </div>
        <div class="filter-categories">
          <button class="filter-cat"
                  [class.filter-cat--active]="!selectedCategory()"
                  (click)="selectCategory(null)">Todos</button>
          @for (cat of categories(); track cat.id) {
            <button class="filter-cat"
                    [class.filter-cat--active]="selectedCategory() === cat.slug"
                    (click)="selectCategory(cat.slug)">
              {{ cat.name }}
            </button>
          }
        </div>
      </div>

      <div class="shop__grid">
        @if (isLoading()) {
          @for (n of [1,2,3,4,5,6]; track n) {
            <div class="product-card--skeleton"></div>
          }
        } @else if (products().length === 0) {
          <div class="shop__empty">
            <p>No hay productos disponibles con los filtros seleccionados.</p>
            <button (click)="resetFilters()" class="btn-reset">Ver todos</button>
          </div>
        } @else {
          @for (product of products(); track product.id) {
            <app-product-card
              [product]="product"
              (addToCart)="onAddToCart($event)"
            />
          }
        }
      </div>

      @if (totalPages() > 1) {
        <nav class="shop__pagination">
          @for (page of pagesArray(); track page) {
            <button class="page-btn"
                    [class.page-btn--active]="currentPage() === page"
                    (click)="goToPage(page)">{{ page }}</button>
          }
        </nav>
      }
    </section>
  `,
  styles: [`
    .shop__header {
      background: var(--gradient-primary);
      padding: clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem);
      text-align: center; color: white;
    }
    .shop__title {
      font-family: var(--font-heading);
      font-size: clamp(2rem, 4vw, 3.5rem);
      font-weight: 800; margin: 0 0 0.5rem;
    }
    .shop__subtitle { font-size: 1.1rem; opacity: 0.85; margin: 0; }

    .shop__filters {
      padding: 1.5rem clamp(1rem, 4vw, 3rem);
      background: var(--color-light);
      display: flex; gap: 1rem; flex-wrap: wrap;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      position: sticky; top: 0; z-index: 10;
    }
    .filter-search__input {
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md); font-size: 0.9rem;
      min-width: 200px;
    }
    .filter-search__input:focus { outline: none; border-color: var(--color-primary); }
    .filter-cat {
      padding: 0.4rem 1rem; border-radius: 100px;
      border: 1px solid var(--color-border);
      background: white; font-size: 0.85rem; cursor: pointer;
    }
    .filter-cat--active {
      background: var(--color-primary); border-color: var(--color-primary); color: white;
    }

    .shop__grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem; padding: 2rem clamp(1rem, 4vw, 3rem);
    }
    @media (max-width: 1200px) { .shop__grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 900px) { .shop__grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .shop__grid { grid-template-columns: 1fr; } }

    .product-card--skeleton {
      animation: shimmer 1.5s infinite;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      height: 350px; border-radius: var(--radius-lg);
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .shop__empty {
      grid-column: 1 / -1; text-align: center;
      padding: 3rem; color: var(--color-text-muted);
    }
    .btn-reset {
      padding: 0.5rem 1.5rem; border-radius: var(--radius-md);
      background: var(--color-primary); color: white;
      border: none; cursor: pointer; margin-top: 1rem;
    }

    .shop__pagination {
      display: flex; justify-content: center; gap: 0.5rem;
      padding: 2rem clamp(1rem, 4vw, 3rem);
    }
    .page-btn {
      width: 40px; height: 40px; border-radius: 50%;
      border: 1px solid var(--color-border);
      background: white; cursor: pointer; font-weight: 600;
    }
    .page-btn--active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopHomeComponent {
  private shopService = inject(ShopService);
  private cartStore = inject(CartStore);
  private title = inject(Title);
  private meta = inject(Meta);

  readonly categories = this.shopService.categories;

  readonly selectedCategory = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly isLoading = signal<boolean>(false);

  private readonly filters = computed(() => ({
    category: this.selectedCategory() ?? undefined,
    search: this.searchQuery() || undefined,
    page: this.currentPage(),
    limit: 12,
  }));

  private readonly response = toSignal(
    toObservable(this.filters).pipe(
      debounceTime(300),
      tap(() => this.isLoading.set(true)),
      switchMap(f => this.shopService.getProducts(f).pipe(
        tap(() => this.isLoading.set(false)),
        catchError(() => of({ products: [] as Product[], total: 0, pages: 0 })),
      )),
    ),
    { initialValue: { products: [] as Product[], total: 0, pages: 0 } }
  );

  readonly products = computed(() => this.response().products);
  readonly totalPages = computed(() => this.response().pages);

  readonly pagesArray = computed(() => {
    const pages = this.totalPages();
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  constructor() {
    this.title.setTitle(`Tienda Oficial — ${environment.titleSuffix}`);
    this.meta.updateTag({ name: 'description', content: 'Tienda oficial del CB Tomelloso. Camisetas, equipaciones y merchandising del club.' });
  }

  selectCategory(slug: string | null): void {
    this.selectedCategory.set(slug);
    this.currentPage.set(1);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  resetFilters(): void {
    this.selectedCategory.set(null);
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onAddToCart(event: { productId: number; quantity: number }): void {
    this.cartStore.addItem(event.productId, event.quantity);
  }
}
