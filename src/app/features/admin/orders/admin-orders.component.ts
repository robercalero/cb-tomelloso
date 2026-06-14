import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

interface Order {
  id: number;
  orderNumber: string;
  shippingName: string;
  shippingEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'refunded'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Pedidos</h1>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Nº Pedido</th>
              <th>Cliente</th>
              <th>Email</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr>
                <td><strong>#{{ order.orderNumber }}</strong></td>
                <td>{{ order.shippingName }}</td>
                <td>{{ order.shippingEmail }}</td>
                <td>{{ order.totalAmount | currency:'EUR':'symbol':'1.2-2':'es' }}</td>
                <td>
                  <select
                    class="status-select"
                    [value]="order.status"
                    [disabled]="updating() === order.id"
                    (change)="updateStatus(order.id, $any($event.target).value)"
                  >
                    @for (opt of allowedOptions(order.status); track opt) {
                      <option [value]="opt">{{ opt }}</option>
                    }
                  </select>
                </td>
                <td>{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="actions">
                  <a [routerLink]="['/admin/pedidos', order.orderNumber]" class="btn btn--sm" title="Ver">👁️</a>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty">No hay pedidos registrados</td>
              </tr>
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
    .status-select { padding: 0.3rem 0.5rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.8rem; background: white; cursor: pointer; }
    .status-select:disabled { opacity: 0.5; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  readonly orders = signal<Order[]>([]);
  readonly updating = signal<number | null>(null);

  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;

  allowedOptions(current: string): string[] {
    const t = ORDER_TRANSITIONS[current];
    return t ? [current, ...t] : [current];
  }

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.api.get<{ orders: Order[]; total: number }>('shop/orders').pipe(
      catchError(() => of({ orders: [], total: 0 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.orders.set(data.orders));
  }

  updateStatus(id: number, status: string): void {
    this.updating.set(id);
    this.api.patch<Order>(`shop/orders/${id}/status`, { status }).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.updating.set(null);
      this.orders.set(this.orders().map(o => o.id === id ? { ...o, status } : o));
    });
  }
}
