import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../models/shop.model';

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['pending', 'processing', 'refunded'],
  processing: ['paid', 'shipped'],
  shipped: ['processing', 'delivered'],
  delivered: ['shipped'],
  cancelled: ['pending'],
  refunded: ['paid'],
};

@Component({
  selector: 'app-admin-orders-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page__header">
        <a routerLink="/admin/pedidos" class="back-link">&larr; Volver a pedidos</a>
        <h1>Pedido #{{ order()?.orderNumber }}</h1>
      </div>

      @if (loading()) {
        <p class="loading">Cargando...</p>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (order(); as o) {
        <div class="detail-grid">
          <div class="card">
            <h3>Informaci&oacute;n del pedido</h3>
            <dl>
              <dt>N&uacute;mero</dt>
              <dd>#{{ o.orderNumber }}</dd>
              <dt>Estado</dt>
              <dd>
                <select class="status-select" [value]="o.status" (change)="updateStatus($any($event.target).value)">
                  @for (opt of allowedOptions(o.status); track opt) {
                    <option [value]="opt">{{ ORDER_STATUS_LABELS[opt] || opt }}</option>
                  }
                </select>
              </dd>
              @if (o.status === 'shipped' || o.status === 'delivered') {
                <dt>N&ordm; seguimiento</dt>
                <dd>
                  <input class="tracking-input" type="text"
                         [value]="o.trackingNumber ?? ''"
                         (change)="updateTrackingNumber($any($event.target).value)"
                         placeholder="Añadir nº de seguimiento" />
                </dd>
              }
              <dt>Fecha</dt>
              <dd>{{ o.createdAt | date:'dd/MM/yyyy HH:mm' }}</dd>
              @if (o.paidAt) {
                <dt>Pagado</dt>
                <dd>{{ o.paidAt | date:'dd/MM/yyyy HH:mm' }}</dd>
              }
              @if (o.shippedAt) {
                <dt>Enviado</dt>
                <dd>{{ o.shippedAt | date:'dd/MM/yyyy HH:mm' }}</dd>
              }
            </dl>
          </div>

          <div class="card">
            <h3>Cliente</h3>
            <dl>
              <dt>Nombre</dt>
              <dd>{{ o.shippingName }}</dd>
              <dt>Email</dt>
              <dd>{{ o.shippingEmail }}</dd>
              @if (o.shippingPhone) {
                <dt>Tel&eacute;fono</dt>
                <dd>{{ o.shippingPhone }}</dd>
              }
            </dl>
          </div>

          <div class="card">
            <h3>Direcci&oacute;n de env&iacute;o</h3>
            <dl>
              <dt>Direcci&oacute;n</dt>
              <dd>{{ o.shippingAddress }}</dd>
              <dt>Ciudad</dt>
              <dd>{{ o.shippingCity }}</dd>
              <dt>C&oacute;digo Postal</dt>
              <dd>{{ o.shippingPostalCode }}</dd>
              <dt>Pa&iacute;s</dt>
              <dd>{{ o.shippingCountry }}</dd>
            </dl>
          </div>

          @if (o.notes) {
            <div class="card">
              <h3>Notas</h3>
              <p>{{ o.notes }}</p>
            </div>
          }
        </div>

        <div class="card items-card">
          <h3>Productos ({{ o.items.length }})</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              @for (item of o.items; track item.id) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.productSku ?? '—' }}</td>
                  <td>{{ item.size ?? '—' }}</td>
                  <td>{{ item.color ?? '—' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.unitPrice | currency:'EUR':'symbol':'1.2-2':'es' }}</td>
                  <td>{{ item.subtotal | currency:'EUR':'symbol':'1.2-2':'es' }}</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="total-label">Total</td>
                <td class="total-amount">{{ o.totalAmount | currency:'EUR':'symbol':'1.2-2':'es' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page__header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .page__header h1 { font-family: var(--font-heading); font-weight: 800; margin: 0; }
    .back-link { color: var(--color-primary); text-decoration: none; font-weight: 600; }
    .loading, .error { text-align: center; color: var(--color-text-muted); padding: 2rem; }
    .error { color: #c0392b; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 1.5rem; }
    .card h3 { font-size: 1rem; font-weight: 700; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #eee; }
    .card dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; font-size: 0.9rem; }
    .card dt { color: var(--color-text-muted); font-weight: 600; }
    .card dd { margin: 0; }
    .card p { margin: 0; font-size: 0.9rem; color: var(--color-text-muted); }
    .status-select { padding: 0.3rem 0.5rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.8rem; background: white; cursor: pointer; }
    .tracking-input { padding: 0.3rem 0.5rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.8rem; width: 100%; max-width: 250px; box-sizing: border-box; }
    .items-card { margin-top: 1.5rem; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .items-table th { text-align: left; padding: 0.5rem 0.75rem; background: #fafafa; font-weight: 700; color: var(--color-text-muted); border-bottom: 1px solid #eee; }
    .items-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #eee; }
    .total-label { text-align: right; font-weight: 700; font-size: 0.9rem; }
    .total-amount { font-weight: 800; font-size: 1rem; color: var(--color-primary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersDetailComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;
  protected readonly ORDER_STATUS_LABELS = ORDER_STATUS_LABELS;

  allowedOptions(current: string): string[] {
    const transitions = VALID_TRANSITIONS[current];
    return transitions ? [current, ...transitions] : [current];
  }

  constructor() {
    const orderNumber = this.route.snapshot.paramMap.get('orderNumber');
    if (orderNumber) this.loadOrder(orderNumber);
  }

  private loadOrder(orderNumber: string): void {
    this.loading.set(true);
    this.api.get<Order>(`shop/orders/admin/${orderNumber}`).pipe(
      catchError(() => {
        this.loading.set(false);
        this.error.set('Pedido no encontrado');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(o => {
      if (o) {
        this.order.set(o);
        this.loading.set(false);
      }
    });
  }

  updateStatus(status: string): void {
    const current = this.order();
    if (!current) return;
    this.api.patch<Order>(`shop/orders/${current.id}/status`, { status }).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.order.set({ ...current, status: status as Order['status'] });
    });
  }

  updateTrackingNumber(trackingNumber: string): void {
    const current = this.order();
    if (!current) return;
    this.api.patch<Order>(`shop/orders/${current.id}/status`, {
      status: current.status,
      trackingNumber,
    }).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.order.set({ ...current, trackingNumber });
    });
  }
}
