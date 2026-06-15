import { Injectable, inject, signal, computed, afterNextRender } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ShopService } from './shop.service';
import { CartItem } from '../../models/shop.model';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private shopService = inject(ShopService);

  private _sessionId = signal<string>(this.getOrCreateSessionId());
  private _items = signal<CartItem[]>([]);
  private _isOpen = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);

  readonly sessionId = this._sessionId.asReadonly();
  readonly items = this._items.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly itemCount = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly total = computed(() =>
    this._items().reduce((sum, item) =>
      sum + (Number(item.product?.price ?? 0) * item.quantity), 0
    )
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  readonly formattedTotal = computed(() =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
      .format(this.total())
  );

  constructor() {
    afterNextRender(() => this.loadCart());
  }

  loadCart(): void {
    this._isLoading.set(true);
    this.shopService.getCart(this._sessionId()).pipe(
      catchError(() => of([] as CartItem[]))
    ).subscribe(items => {
      this._items.set(items);
      this._isLoading.set(false);
    });
  }

  addItem(productId: number, quantity: number, size?: string, color?: string): void {
    this.shopService.addToCart(this._sessionId(), { productId, quantity, size, color })
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.reloadCartSilently();
        this.openCart();
      });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    this.shopService.updateCartItem(this._sessionId(), itemId, quantity)
      .pipe(catchError(() => of(null)))
      .subscribe(() => this.reloadCartSilently());
  }

  removeItem(itemId: number): void {
    this.shopService.removeCartItem(this._sessionId(), itemId)
      .pipe(catchError(() => of(null)))
      .subscribe(() => this.reloadCartSilently());
  }

  clearCart(): void {
    this.shopService.clearCart(this._sessionId())
      .pipe(catchError(() => of(null)))
      .subscribe(() => this._items.set([]));
  }

  openCart(): void { this._isOpen.set(true); }

  closeCart(): void { this._isOpen.set(false); }

  toggleCart(): void { this._isOpen.update(v => !v); }

  private reloadCartSilently(): void {
    this.shopService.getCart(this._sessionId()).pipe(
      catchError(() => of([] as CartItem[]))
    ).subscribe(items => this._items.set(items));
  }

  private getOrCreateSessionId(): string {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return this.generateFallbackId();
      }
      const KEY = 'cbt_cart_session';
      let id = localStorage.getItem(KEY);
      if (!id) {
        id = this.generateFallbackId();
        localStorage.setItem(KEY, id);
      }
      return id;
    } catch {
      return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
  }

  private generateFallbackId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
