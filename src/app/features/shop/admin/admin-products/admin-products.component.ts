import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ShopService } from '../../../../core/services/shop.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product } from '../../../../models/shop.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    @if (!authService.isEditor()) {
      <div class="admin-access-denied">
        <p>Necesitas permisos de administrador o editor para acceder.</p>
        <a routerLink="/">Volver al inicio</a>
      </div>
    } @else {
      <div class="admin-products">
        <div class="admin-header">
          <h1>Gesti&oacute;n de productos</h1>
          <a routerLink="/admin/tienda/nuevo" class="btn-add">+ Nuevo producto</a>
        </div>

        <table class="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categor&iacute;a</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Destacado</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr>
                <td>
                  <div class="product-cell">
                    @if (product.images?.[0]) {
                      <img [src]="product.images![0]" [alt]="product.name" class="product-thumb" />
                    }
                    <div>
                      <span class="product-name">{{ product.name }}</span>
                      <span class="product-slug">{{ product.slug }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ product.category?.name || '-' }}</td>
                <td>{{ product.price | currency:'EUR':'symbol':'1.2-2':'es' }}</td>
                <td>
                  @if (product.stock > 0 && product.stock < 5) {
                    <span class="stock-low">¡Solo {{ product.stock }}!</span>
                  } @else if (product.stock === 0) {
                    <span class="stock-none">Sin stock</span>
                  } @else {
                    {{ product.stock }}
                  }
                </td>
                <td>{{ product.isFeatured ? 'S&iacute;' : 'No' }}</td>
                <td>{{ product.isActive ? 'S&iacute;' : 'No' }}</td>
                <td>
                  <a [routerLink]="['/admin/tienda', product.slug]" class="btn-edit">Editar</a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .admin-products { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .admin-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 2rem;
    }
    .admin-header h1 { font-family: var(--font-heading); font-weight: 800; margin: 0; }
    .btn-add {
      padding: 0.6rem 1.25rem; background: var(--color-primary);
      color: white; text-decoration: none; border-radius: var(--radius-md);
      font-weight: 600;
    }
    .admin-table {
      width: 100%; border-collapse: collapse;
      background: white; border-radius: var(--radius-lg);
      overflow: hidden; box-shadow: var(--shadow-card);
    }
    .admin-table th {
      text-align: left; padding: 0.75rem 1rem;
      background: var(--color-dark); color: white;
      font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .admin-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; }
    .product-cell { display: flex; align-items: center; gap: 0.75rem; }
    .product-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
    .product-name { display: block; font-weight: 600; }
    .product-slug { font-size: 0.75rem; color: var(--color-text-muted); }
    .stock-low { background: #fef9e7; color: #e67e22; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
    .stock-none { background: #fdedec; color: #c0392b; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 700; }
    .btn-edit {
      padding: 0.35rem 0.75rem; background: var(--color-secondary);
      color: white; text-decoration: none; border-radius: 4px; font-size: 0.8rem;
    }
    .admin-access-denied {
      text-align: center; padding: 4rem 2rem; color: var(--color-text-muted);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductsComponent {
  private shopService = inject(ShopService);
  readonly authService = inject(AuthService);

  private readonly response = toSignal(
    this.shopService.getProducts({ limit: 100 }).pipe(
      catchError(() => of({ products: [] as Product[], total: 0, pages: 0 }))
    ),
    { initialValue: { products: [] as Product[], total: 0, pages: 0 } }
  );

  readonly products = computed(() => this.response().products);
}
