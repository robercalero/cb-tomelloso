import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../models/shop.model';
import { PRODUCT_PLACEHOLDER } from '../../utils/placeholder';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="product-card">
      <a [routerLink]="'/tienda/' + product().slug" class="product-card__link">
        <img [src]="(product().images ?? [])[0] || placeholder"
             [alt]="product().name"
             class="product-card__image"
             fetchpriority="auto"
             [loading]="priority() === 'high' ? 'eager' : 'lazy'" />
      </a>
      <div class="product-card__body">
        @if (product().category) {
          <span class="product-card__category">{{ product().category!.name }}</span>
        }
        <a [routerLink]="'/tienda/' + product().slug" class="product-card__name-link">
          <h3 class="product-card__name">{{ product().name }}</h3>
        </a>
        <div class="product-card__prices">
          <span class="product-card__price">
            {{ product().price | currency:'EUR':'symbol':'1.2-2':'es' }}
          </span>
          @if (product().comparePrice) {
            <span class="product-card__compare">
              {{ product().comparePrice | currency:'EUR':'symbol':'1.2-2':'es' }}
            </span>
            <span class="product-card__badge">
              -{{ discountPercent() }}%
            </span>
          }
        </div>
        <button class="product-card__cta"
                [disabled]="product().stock === 0"
                (click)="onAddToCart($event)">
          @if (product().stock > 0) {
            Añadir al carrito
          } @else {
            Sin stock
          }
        </button>
      </div>
    </article>
  `,
  styles: [`
    .product-card {
      background: white;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-card);
      transition: transform 250ms ease, box-shadow 250ms ease;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-card-hover);
    }
    .product-card__link { display: block; text-decoration: none; }
    .product-card__image {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      background: var(--color-light);
      display: block;
    }
    .product-card__body { padding: 1rem; }
    .product-card__category {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
      font-weight: 600;
    }
    .product-card__name-link {
      text-decoration: none; color: inherit;
    }
    .product-card__name {
      font-family: var(--font-heading);
      font-size: 1.05rem; font-weight: 700;
      margin: 0.3rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .product-card__prices {
      display: flex; align-items: center;
      gap: 0.5rem; margin-bottom: 0.75rem;
    }
    .product-card__price {
      font-size: 1.1rem; font-weight: 700; color: var(--color-primary-text);
    }
    .product-card__compare {
      font-size: 0.9rem; text-decoration: line-through;
      color: var(--color-text-muted);
    }
    .product-card__badge {
      font-size: 0.7rem; font-weight: 700;
      background: var(--color-accent); color: #1a1a1a;
      padding: 0.15rem 0.4rem; border-radius: 4px;
    }
    .product-card__cta {
      width: 100%; padding: 0.6rem;
      background: var(--color-primary); color: #1a1a1a;
      border: none; border-radius: var(--radius-md);
      font-weight: 600; font-size: 0.9rem;
      cursor: pointer; transition: background 150ms ease;
    }
    .product-card__cta:hover { background: var(--color-primary-light); }
    .product-card__cta:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly priority = input<'high' | 'auto'>('auto');


  readonly addToCart = output<{ productId: number; quantity: number }>();

  protected readonly placeholder = PRODUCT_PLACEHOLDER;

  readonly discountPercent = computed(() => {
    const p = this.product();
    if (!p.comparePrice) return 0;
    return Math.round((1 - p.price / p.comparePrice) * 100);
  });

  onAddToCart(event: Event): void {
    event.preventDefault();
    this.addToCart.emit({ productId: this.product().id, quantity: 1 });
  }
}
