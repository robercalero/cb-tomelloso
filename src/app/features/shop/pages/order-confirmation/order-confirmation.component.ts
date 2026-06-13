import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ShopService } from '../../../../core/services/shop.service';
import { Order } from '../../../../models/shop.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="confirmation">
      @if (order(); as o) {
        <div class="confirmation__card">
          <div class="confirmation__icon">&#10003;</div>
          <h1 class="confirmation__title">Pedido confirmado</h1>
          <p class="confirmation__number">N.&ordm; de pedido: <strong>{{ o.orderNumber }}</strong></p>
          <p class="confirmation__status">Estado: {{ statusLabel(o.status) }}</p>

          <div class="confirmation__details">
            <h2>Detalles del pedido</h2>

            <div class="details-section">
              <h3>Productos</h3>
              @for (item of o.items; track item.id) {
                <div class="confirmation-item">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.productName"
                         class="confirmation-item__img" />
                  }
                  <div class="confirmation-item__info">
                    <p class="confirmation-item__name">{{ item.productName }}</p>
                    @if (item.size || item.color) {
                      <p class="confirmation-item__variant">
                        {{ item.size ? 'Talla: ' + item.size : '' }}{{ item.size && item.color ? ' | ' : '' }}{{ item.color ? 'Color: ' + item.color : '' }}
                      </p>
                    }
                    <p class="confirmation-item__qty">{{ item.quantity }} ud x {{ item.unitPrice | currency:'EUR':'symbol':'1.2-2':'es' }}</p>
                  </div>
                  <p class="confirmation-item__total">{{ item.subtotal | currency:'EUR':'symbol':'1.2-2':'es' }}</p>
                </div>
              }
            </div>

            <div class="details-section">
              <h3>Direcci&oacute;n de env&iacute;o</h3>
              <p>{{ o.shippingName }}</p>
              <p>{{ o.shippingAddress }}</p>
              <p>{{ o.shippingCity }}, {{ o.shippingPostalCode }}</p>
              <p>{{ o.shippingCountry }}</p>
              <p>{{ o.shippingEmail }}</p>
            </div>

            <div class="confirmation-total">
              <span>Total pagado</span>
              <strong>{{ o.totalAmount | currency:'EUR':'symbol':'1.2-2':'es' }}</strong>
            </div>

            <p class="confirmation__date">
              Pedido realizado el {{ o.createdAt | date:'fullDate':'':'es' }}
            </p>
          </div>

          <a routerLink="/tienda" class="btn-continue">Seguir comprando</a>
        </div>
      } @else if (isLoading()) {
        <div class="confirmation__loading">Cargando pedido...</div>
      } @else {
        <div class="confirmation__error">
          <p>No se encontr&oacute; el pedido.</p>
          <a routerLink="/tienda" class="btn-continue">Ir a la tienda</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .confirmation {
      max-width: 700px; margin: 0 auto;
      padding: 3rem clamp(1rem, 4vw, 3rem); text-align: center;
    }
    .confirmation__card {
      background: white; border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); padding: 2.5rem;
      text-align: left;
    }
    .confirmation__icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--color-secondary); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; margin: 0 auto 1rem;
    }
    .confirmation__title {
      font-family: var(--font-heading);
      font-size: 1.8rem; font-weight: 800;
      text-align: center; margin-bottom: 0.5rem;
    }
    .confirmation__number {
      text-align: center; color: var(--color-text-muted);
      margin-bottom: 0.25rem;
    }
    .confirmation__status {
      text-align: center; font-weight: 600; margin-bottom: 2rem;
    }
    .confirmation__details { border-top: 1px solid var(--color-border); padding-top: 1.5rem; }
    .confirmation__details h2 {
      font-family: var(--font-heading);
      font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem;
    }
    .details-section { margin-bottom: 1.5rem; }
    .details-section h3 {
      font-size: 0.9rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--color-text-muted); margin-bottom: 0.5rem;
    }
    .details-section p { margin: 0 0 0.2rem; font-size: 0.95rem; }
    .confirmation-item {
      display: flex; gap: 0.75rem; padding: 0.75rem 0;
      border-bottom: 1px solid var(--color-border);
    }
    .confirmation-item__img {
      width: 50px; height: 50px; object-fit: cover;
      border-radius: var(--radius-sm);
    }
    .confirmation-item__info { flex: 1; }
    .confirmation-item__name { font-weight: 600; margin: 0 0 0.2rem; font-size: 0.9rem; }
    .confirmation-item__variant { font-size: 0.8rem; color: var(--color-text-muted); margin: 0; }
    .confirmation-item__qty { font-size: 0.8rem; color: var(--color-text-muted); margin: 0.2rem 0 0; }
    .confirmation-item__total { font-weight: 700; }
    .confirmation-total {
      display: flex; justify-content: space-between;
      font-size: 1.2rem; padding: 1rem 0;
      border-top: 2px solid var(--color-border);
    }
    .confirmation-total strong { font-size: 1.4rem; }
    .confirmation__date {
      text-align: center; font-size: 0.85rem;
      color: var(--color-text-muted); margin-top: 1rem;
    }
    .btn-continue {
      display: block; text-align: center; margin-top: 1.5rem;
      padding: 0.85rem; border-radius: var(--radius-md);
      background: var(--color-primary); color: white;
      font-weight: 700; text-decoration: none;
    }
    .confirmation__loading, .confirmation__error {
      padding: 4rem 2rem; color: var(--color-text-muted);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shopService = inject(ShopService);
  private title = inject(Title);

  readonly order = signal<Order | null>(null);
  readonly isLoading = signal(true);

  readonly statusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pendiente de pago',
      paid: 'Pagado',
      processing: 'En preparación',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return labels[status] || status;
  };

  constructor() {
    this.title.setTitle(`Pedido confirmado — ${environment.titleSuffix}`);
  }

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('orderNumber');
    if (!param) {
      this.isLoading.set(false);
      return;
    }

    const obs = param.startsWith('cs_')
      ? this.shopService.getOrderByStripeSession(param)
      : this.shopService.getOrderByNumber(param);

    obs.subscribe(o => {
      this.order.set(o);
      this.isLoading.set(false);
    });
  }
}
