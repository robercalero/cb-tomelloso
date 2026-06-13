import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductCategory, CartItem, Order, CheckoutForm } from '../../models/shop.model';

@Injectable({ providedIn: 'root' })
export class ShopService {
  private api = inject(ApiService);

  readonly featuredProducts = toSignal(
    this.api.get<Product[]>('shop/products/featured').pipe(
      catchError(() => of([] as Product[]))
    ),
    { initialValue: [] as Product[] }
  );

  readonly categories = toSignal(
    this.api.get<ProductCategory[]>('shop/categories').pipe(
      catchError(() => of([] as ProductCategory[]))
    ),
    { initialValue: [] as ProductCategory[] }
  );

  getProducts(filters: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<{ products: Product[]; total: number; pages: number }> {
    const params: Record<string, string | number | undefined> = {};
    if (filters.category) params['category'] = filters.category;
    if (filters.search) params['search'] = filters.search;
    if (filters.page) params['page'] = filters.page;
    if (filters.limit) params['limit'] = filters.limit;
    return this.api.get<{ products: Product[]; total: number; pages: number }>('shop/products', params)
      .pipe(catchError(() => of({ products: [], total: 0, pages: 0 })));
  }

  getProductBySlug(slug: string): Observable<Product | null> {
    return this.api.get<Product>(`shop/products/${slug}`).pipe(
      catchError(() => of(null))
    );
  }

  getCart(sessionId: string): Observable<CartItem[]> {
    return this.api.get<CartItem[]>(`shop/cart/${sessionId}`).pipe(
      catchError(() => of([] as CartItem[]))
    );
  }

  addToCart(sessionId: string, item: {
    productId: number;
    quantity: number;
    size?: string;
    color?: string;
  }): Observable<CartItem> {
    return this.api.post<CartItem>(`shop/cart/${sessionId}`, item);
  }

  updateCartItem(sessionId: string, itemId: number, quantity: number): Observable<CartItem | null> {
    return this.api.patch<CartItem | null>(`shop/cart/${sessionId}/${itemId}`, { quantity });
  }

  removeCartItem(sessionId: string, itemId: number): Observable<void> {
    return this.api.delete<void>(`shop/cart/${sessionId}/${itemId}`);
  }

  clearCart(sessionId: string): Observable<void> {
    return this.api.delete<void>(`shop/cart/${sessionId}`);
  }

  createOrder(sessionId: string, form: CheckoutForm): Observable<Order> {
    return this.api.post<Order>('shop/orders', { ...form, sessionId });
  }

  createCheckoutSession(data: {
    sessionId: string;
    form: CheckoutForm;
  }): Observable<{ url: string; sessionId: string }> {
    return this.api.post<{ url: string; sessionId: string }>('shop/payments/checkout', {
      ...data.form,
      sessionId: data.sessionId,
    });
  }

  getOrderByNumber(orderNumber: string): Observable<Order | null> {
    return this.api.get<Order>(`shop/orders/${orderNumber}`).pipe(
      catchError(() => of(null))
    );
  }

  getOrderByStripeSession(stripeSessionId: string): Observable<Order | null> {
    return this.api.get<Order>(`shop/orders/by-stripe-session/${stripeSessionId}`).pipe(
      catchError(() => of(null))
    );
  }
}
