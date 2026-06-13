import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ShopService } from '../../../../core/services/shop.service';
import { CartStore } from '../../../../core/services/cart.store';
import { Product, ProductColor } from '../../../../models/shop.model';
import { SizeSelectorComponent } from '../../../../shared/components/size-selector/size-selector.component';
import { ColorSelectorComponent } from '../../../../shared/components/color-selector/color-selector.component';
import { QuantityInputComponent } from '../../../../shared/components/quantity-input/quantity-input.component';
import { environment } from '../../../../../environments/environment';
import { PRODUCT_PLACEHOLDER } from '../../../../shared/utils/placeholder';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink, CurrencyPipe,
    SizeSelectorComponent, ColorSelectorComponent, QuantityInputComponent,
  ],
  template: `
    @if (product(); as p) {
      <div class="product-detail">
        <div class="product-detail__gallery">
          <div class="gallery-main">
            @if (images().length > 1) {
              <button class="gallery-arrow gallery-arrow--prev"
                      (click)="prevImage()"
                      aria-label="Imagen anterior">&lsaquo;</button>
            }
            <img [src]="currentImage() || placeholder"
                 [alt]="p.name"
                 class="gallery-main__img"
                 loading="lazy" />
            @if (images().length > 1) {
              <button class="gallery-arrow gallery-arrow--next"
                      (click)="nextImage()"
                      aria-label="Imagen siguiente">&rsaquo;</button>
            }
          </div>
          @if (images().length > 1) {
            <div class="gallery-dots">
              @for (img of images(); track img; let i = $index) {
                <button class="gallery-dot"
                        [class.gallery-dot--active]="i === selectedImageIndex()"
                        (click)="goToImage(i)"
                        [attr.aria-label]="'Imagen ' + (i + 1)"></button>
              }
            </div>
          }
        </div>

        <div class="product-detail__info">
          @if (p.category) {
            <span class="product-detail__category">{{ p.category.name }}</span>
          }
          <h1 class="product-detail__name">{{ p.name }}</h1>

          <div class="product-detail__price">
            <span class="price-current">{{ p.price | currency:'EUR':'symbol':'1.2-2':'es' }}</span>
            @if (p.comparePrice) {
              <span class="price-original">{{ p.comparePrice | currency:'EUR':'symbol':'1.2-2':'es' }}</span>
              <span class="price-badge">-{{ discountPercent() }}%</span>
            }
          </div>

          <p class="product-detail__description">{{ p.description }}</p>

          @if ((p.sizes ?? []).length > 0) {
            <div class="product-detail__sizes">
              <label class="selector-label">Talla</label>
              <app-size-selector
                [sizes]="p.sizes ?? []"
                [selected]="selectedSize()"
                (sizeSelected)="selectedSize.set($event)"
              />
            </div>
          }

          @if ((p.colors ?? []).length > 0) {
            <div class="product-detail__colors">
              <label class="selector-label">Color: {{ selectedColor()?.name }}</label>
              <app-color-selector
                [colors]="p.colors ?? []"
                [selected]="selectedColor()"
                (colorSelected)="onColorSelected($event)"
              />
            </div>
          }

          <div class="product-detail__quantity">
            <label class="selector-label">Cantidad</label>
            <app-quantity-input
              [value]="quantity()"
              [max]="p.stock"
              (quantityChange)="quantity.set($event)"
            />
          </div>

          <p class="product-detail__stock"
             [class.stock--low]="p.stock > 0 && p.stock <= 5">
            @if (p.stock > 5) {
              En stock ({{ p.stock }} unidades)
            } @else if (p.stock > 0) {
              Solo quedan {{ p.stock }} unidades
            } @else {
              Sin stock
            }
          </p>

          <button class="btn-add-to-cart"
                  [disabled]="p.stock === 0 || isAddingToCart()"
                  (click)="addToCart()">
            @if (isAddingToCart()) {
              Añadiendo...
            } @else {
              Añadir al carrito
            }
          </button>
        </div>
      </div>
    } @else if (isLoading()) {
      <div class="product-detail--loading">Cargando producto...</div>
    } @else {
      <div class="product-detail--not-found">
        <p>Producto no encontrado.</p>
        <a routerLink="/tienda" class="btn-back">Volver a la tienda</a>
      </div>
    }
  `,
  styles: [`
    .product-detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem clamp(1rem, 4vw, 3rem);
    }
    @media (max-width: 768px) {
      .product-detail { grid-template-columns: 1fr; gap: 2rem; }
    }

    .product-detail__gallery { display: flex; flex-direction: column; gap: 0.75rem; }

    .gallery-main {
      position: relative;
      display: flex;
      align-items: center;
    }
    .gallery-main__img {
      width: 100%;
      border-radius: var(--radius-lg);
      background: var(--color-light);
      aspect-ratio: 1;
      object-fit: cover;
    }
    .gallery-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: none;
      font-size: 1.8rem;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: background 150ms ease, transform 150ms ease;
      z-index: 2;
      color: var(--color-text);
    }
    .gallery-arrow:hover {
      background: white;
      transform: translateY(-50%) scale(1.1);
    }
    .gallery-arrow--prev { left: 0.75rem; }
    .gallery-arrow--next { right: 0.75rem; }

    .gallery-dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.25rem 0;
    }
    .gallery-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .gallery-dot--active {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    .product-detail__category {
      font-size: 0.8rem; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--color-text-muted);
      font-weight: 600;
    }
    .product-detail__name {
      font-family: var(--font-heading);
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      font-weight: 800; margin: 0.5rem 0;
    }
    .product-detail__price { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .price-current { font-size: 1.8rem; font-weight: 800; color: var(--color-primary); }
    .price-original { font-size: 1.2rem; text-decoration: line-through; color: var(--color-text-muted); }
    .price-badge {
      font-size: 0.8rem; font-weight: 700;
      background: var(--color-accent); color: white;
      padding: 0.2rem 0.5rem; border-radius: 4px;
    }
    .product-detail__description {
      font-size: 1rem; line-height: 1.7;
      color: var(--color-text-muted); margin-bottom: 1.5rem;
    }
    .selector-label {
      display: block; font-weight: 600; font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .product-detail__sizes,
    .product-detail__colors,
    .product-detail__quantity { margin-bottom: 1.25rem; }
    .product-detail__stock { font-size: 0.9rem; font-weight: 600; padding: 0.5rem 0; margin-bottom: 1rem; }
    .stock--low { color: var(--color-error); }
    .btn-add-to-cart {
      width: 100%; padding: 1rem;
      background: var(--color-primary); color: white;
      border: none; border-radius: var(--radius-md);
      font-size: 1.1rem; font-weight: 700;
      cursor: pointer; transition: background 150ms ease;
    }
    .btn-add-to-cart:hover:not(:disabled) { background: var(--color-primary-light); }
    .btn-add-to-cart:disabled { opacity: 0.5; cursor: not-allowed; }
    .product-detail--loading,
    .product-detail--not-found { text-align: center; padding: 4rem 2rem; color: var(--color-text-muted); }
    .btn-back {
      display: inline-block; margin-top: 1rem;
      padding: 0.75rem 2rem; background: var(--color-primary);
      color: white; text-decoration: none; border-radius: var(--radius-md);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shopService = inject(ShopService);
  private cartStore = inject(CartStore);
  private title = inject(Title);
  private meta = inject(Meta);

  readonly selectedSize = signal<string | null>(null);
  readonly selectedColor = signal<ProductColor | null>(null);
  readonly selectedImageIndex = signal<number>(0);
  readonly quantity = signal<number>(1);
  readonly isAddingToCart = signal<boolean>(false);
  readonly isLoading = signal(true);
  readonly product = signal<Product | null>(null);

  readonly images = computed(() => this.product()?.images ?? []);

  readonly currentImage = computed(() => {
    const imgs = this.images();
    const idx = this.selectedImageIndex();
    return imgs.length > 0 ? imgs[idx] : null;
  });

  protected readonly placeholder = PRODUCT_PLACEHOLDER;

  readonly discountPercent = computed(() => {
    const p = this.product();
    if (!p?.comparePrice) return 0;
    return Math.round((1 - p.price / p.comparePrice) * 100);
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.isLoading.set(false);
      return;
    }
    this.shopService.getProductBySlug(slug).pipe(
      catchError(() => {
        this.isLoading.set(false);
        return of(null);
      }),
    ).subscribe(p => {
      if (p) {
        this.product.set(p);
        this.selectedSize.set(p.sizes?.[0] ?? null);
        this.selectedColor.set(p.colors?.[0] ?? null);
        this.title.setTitle(`${p.name} — ${environment.titleSuffix}`);
        this.meta.updateTag({ name: 'description', content: p.description || '' });
      }
      this.isLoading.set(false);
    });
  }

  prevImage(): void {
    const len = this.images().length;
    if (len <= 1) return;
    this.selectedImageIndex.update(i => (i - 1 + len) % len);
  }

  nextImage(): void {
    const len = this.images().length;
    if (len <= 1) return;
    this.selectedImageIndex.update(i => (i + 1) % len);
  }

  goToImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  onColorSelected(color: ProductColor): void {
    this.selectedColor.set(color);
    const colors = this.product()?.colors ?? [];
    const colorIdx = colors.findIndex(c => c.name === color.name && c.hex === color.hex);
    if (colorIdx >= 0 && colorIdx < this.images().length) {
      this.selectedImageIndex.set(colorIdx);
    }
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.isAddingToCart.set(true);
    this.cartStore.addItem(
      p.id,
      this.quantity(),
      this.selectedSize() || undefined,
      this.selectedColor()?.name || undefined,
    );
    setTimeout(() => this.isAddingToCart.set(false), 500);
  }
}
