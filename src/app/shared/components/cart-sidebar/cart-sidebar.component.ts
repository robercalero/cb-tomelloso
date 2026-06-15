import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartStore } from '../../../core/services/cart.store';
import { PRODUCT_PLACEHOLDER } from '../../utils/placeholder';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="cart-overlay"
         [class.cart-overlay--visible]="cartStore.isOpen()"
         (click)="cartStore.closeCart()"
         aria-hidden="true"></div>

    <aside class="cart-sidebar"
           [class.cart-sidebar--open]="cartStore.isOpen()"
           role="dialog"
           aria-label="Carrito de compra"
           [attr.aria-hidden]="!cartStore.isOpen()"
           [attr.inert]="!cartStore.isOpen() ? '' : null">

      <div class="cart-sidebar__header">
        <h2 class="cart-sidebar__title">
          Carrito ({{ cartStore.itemCount() }})
        </h2>
        <button class="cart-sidebar__close"
                (click)="cartStore.closeCart()"
                aria-label="Cerrar carrito">&times;</button>
      </div>

      <div class="cart-sidebar__body">
        @if (cartStore.isEmpty()) {
          <div class="cart-empty">
            <p>Tu carrito está vacío</p>
            <a routerLink="/tienda" (click)="cartStore.closeCart()"
               class="cart-empty__link">Ver productos</a>
          </div>
        } @else {
          @for (item of cartStore.items(); track item.id) {
            <div class="cart-item">
              <img [src]="(item.product.images ?? [])[0] || placeholder"
                   [alt]="item.product.name"
                   class="cart-item__img"
                   loading="lazy" />
              <div class="cart-item__info">
                <p class="cart-item__name">{{ item.product.name }}</p>
                @if (item.size) {
                  <p class="cart-item__variant">Talla: {{ item.size }}</p>
                }
                @if (item.color) {
                  <p class="cart-item__variant">Color: {{ item.color }}</p>
                }
                <div class="cart-item__controls">
                  <button (click)="cartStore.updateQuantity(item.id, item.quantity - 1)">&minus;</button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
                </div>
              </div>
              <div class="cart-item__price-col">
                <p class="cart-item__price">
                  {{ (item.product.price * item.quantity) | currency:'EUR':'symbol':'1.2-2':'es' }}
                </p>
                <button class="cart-item__remove"
                        (click)="cartStore.removeItem(item.id)"
                        aria-label="Eliminar producto">&times;</button>
              </div>
            </div>
          }
        }
      </div>

      @if (!cartStore.isEmpty()) {
        <div class="cart-sidebar__footer">
          <div class="cart-total">
            <span>Total:</span>
            <strong>{{ cartStore.formattedTotal() }}</strong>
          </div>
          <a routerLink="/tienda/checkout"
             (click)="cartStore.closeCart()"
             class="btn-checkout">
            Finalizar compra
          </a>
          <button (click)="cartStore.clearCart()" class="btn-clear">
            Vaciar carrito
          </button>
        </div>
      }
    </aside>
  `,
  styles: [`
    .cart-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      z-index: 100; opacity: 0; pointer-events: none;
      transition: opacity 250ms ease;
    }
    .cart-overlay--visible { opacity: 1; pointer-events: all; }

    .cart-sidebar {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: min(420px, 100vw); background: white;
      z-index: 101; display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 250ms ease;
      box-shadow: -4px 0 30px rgba(0,0,0,0.15);
    }
    .cart-sidebar--open { transform: translateX(0); }

    .cart-sidebar__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-dark); color: white;
    }
    .cart-sidebar__title { font-family: var(--font-heading); font-size: 1.2rem; margin: 0; }
    .cart-sidebar__close {
      background: none; border: none; color: white;
      font-size: 1.5rem; cursor: pointer; padding: 0.25rem;
      line-height: 1;
    }
    .cart-sidebar__body { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; }
    .cart-sidebar__footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--color-border);
      display: flex; flex-direction: column; gap: 0.75rem;
    }

    .cart-empty { text-align: center; padding: 3rem 1rem; }
    .cart-empty p { color: var(--color-text-muted); margin-bottom: 1rem; }
    .cart-empty__link {
      color: var(--color-primary); font-weight: 600;
      text-decoration: none;
    }

    .cart-item {
      display: flex; gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--color-border);
    }
    .cart-item__img {
      width: 64px; height: 64px; object-fit: cover;
      border-radius: var(--radius-sm); flex-shrink: 0;
    }
    .cart-item__info { flex: 1; min-width: 0; }
    .cart-item__name {
      font-size: 0.85rem; font-weight: 600;
      margin: 0 0 0.25rem;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .cart-item__variant { font-size: 0.75rem; color: var(--color-text-muted); margin: 0 0 0.25rem; }
    .cart-item__controls {
      display: flex; align-items: center; gap: 0.5rem;
      margin-top: 0.25rem;
    }
    .cart-item__controls button {
      width: 24px; height: 24px; border-radius: 50%;
      border: 1px solid var(--color-border);
      background: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem;
    }
    .cart-item__controls span { font-size: 0.85rem; min-width: 1rem; text-align: center; }
    .cart-item__price-col { text-align: right; flex-shrink: 0; }
    .cart-item__price {
      font-weight: 700; font-size: 0.9rem;
      margin: 0 0 0.25rem;
    }
    .cart-item__remove {
      background: none; border: none; color: var(--color-text-muted);
      cursor: pointer; font-size: 1rem;
    }

    .cart-total {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 1.1rem;
    }
    .cart-total strong { font-size: 1.3rem; }

    .btn-checkout {
      display: block; text-align: center;
      padding: 0.85rem; border-radius: var(--radius-md);
      background: var(--color-accent); color: white;
      font-weight: 700; font-size: 1rem;
      text-decoration: none;
      transition: background 150ms ease;
    }
    .btn-checkout:hover { background: var(--color-accent-hover); }

    .btn-clear {
      background: none; border: none; color: var(--color-text-muted);
      font-size: 0.85rem; cursor: pointer; text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSidebarComponent {
  cartStore = inject(CartStore);

  protected readonly placeholder = PRODUCT_PLACEHOLDER;
}
