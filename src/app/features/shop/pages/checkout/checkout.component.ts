import { ChangeDetectionStrategy, Component, inject, signal, PLATFORM_ID, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { CartStore } from '../../../../core/services/cart.store';
import { ShopService } from '../../../../core/services/shop.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ReactiveFormsModule],
  template: `
    <div class="checkout">
      <h1 class="checkout__title">Finalizar compra</h1>

      @if (cartStore.isEmpty()) {
        <div class="checkout__empty">
          <p>Tu carrito está vacío.</p>
          <a routerLink="/tienda" class="btn-back">Ir a la tienda</a>
        </div>
      } @else {
        <div class="checkout__layout">
          <div class="checkout__form">
            <h2>Datos de env&iacute;o</h2>

            <form [formGroup]="checkoutForm">
              <div class="form-group">
                <label for="name">Nombre completo</label>
                <input id="name" formControlName="shippingName"
                       placeholder="Nombre y apellidos"
                       [class.is-invalid]="checkoutForm.controls.shippingName.invalid && checkoutForm.controls.shippingName.touched" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email</label>
                  <input id="email" formControlName="shippingEmail" type="email"
                         placeholder="email@ejemplo.com"
                         [class.is-invalid]="checkoutForm.controls.shippingEmail.invalid && checkoutForm.controls.shippingEmail.touched" />
                </div>
                <div class="form-group">
                  <label for="phone">Tel&eacute;fono</label>
                  <input id="phone" formControlName="shippingPhone" type="tel"
                         placeholder="612 345 678" />
                </div>
              </div>

              <div class="form-group">
                <label for="address">Direcci&oacute;n</label>
                <input id="address" formControlName="shippingAddress"
                       placeholder="Calle, número, piso"
                       [class.is-invalid]="checkoutForm.controls.shippingAddress.invalid && checkoutForm.controls.shippingAddress.touched" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city">Ciudad</label>
                  <input id="city" formControlName="shippingCity"
                         placeholder="Ciudad"
                         [class.is-invalid]="checkoutForm.controls.shippingCity.invalid && checkoutForm.controls.shippingCity.touched" />
                </div>
                <div class="form-group">
                  <label for="postal">C&oacute;digo postal</label>
                  <input id="postal" formControlName="shippingPostalCode"
                         placeholder="13700"
                         [class.is-invalid]="checkoutForm.controls.shippingPostalCode.invalid && checkoutForm.controls.shippingPostalCode.touched" />
                </div>
              </div>

              <div class="form-group">
                <label for="notes">Notas (opcional)</label>
                <textarea id="notes" formControlName="notes"
                          placeholder="Alguna nota para el pedido..."
                          rows="3"></textarea>
              </div>
            </form>
          </div>

          <div class="checkout__summary">
            <h2>Resumen del pedido</h2>

            @for (item of cartStore.items(); track item.id) {
              <div class="summary-item">
                <img [src]="(item.product.images ?? [])[0] || 'https://placehold.co/100x100/eee/333?text=N/A'"
                     [alt]="item.product.name"
                     class="summary-item__img" />
                <div class="summary-item__info">
                  <p class="summary-item__name">{{ item.product.name }}</p>
                  @if (item.size) {
                    <p class="summary-item__variant">Talla: {{ item.size }}</p>
                  }
                  @if (item.color) {
                    <p class="summary-item__variant">Color: {{ item.color }}</p>
                  }
                  <p class="summary-item__qty">Cant: {{ item.quantity }}</p>
                </div>
                <p class="summary-item__price">
                  {{ (item.product.price * item.quantity) | currency:'EUR':'symbol':'1.2-2':'es' }}
                </p>
              </div>
            }

            <div class="summary-total">
              <span>Total</span>
              <strong>{{ cartStore.formattedTotal() }}</strong>
            </div>

            @if (errorMessage()) {
              <div class="checkout__error">{{ errorMessage() }}</div>
            }

            <button class="btn-pay"
                    [disabled]="isProcessing() || checkoutForm.invalid"
                    (click)="placeOrder()">
              @if (isProcessing()) {
                Procesando...
              } @else {
                Pagar con tarjeta
              }
            </button>

            @if (checkoutForm.invalid && checkoutForm.touched) {
              <p class="checkout__form-error">Revisa los campos obligatorios</p>
            }

            <p class="checkout__secure">
              Pago seguro procesado por Stripe.
            </p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout {
      max-width: 1200px; margin: 0 auto;
      padding: 2rem clamp(1rem, 4vw, 3rem);
    }
    .checkout__title {
      font-family: var(--font-heading);
      font-size: 2rem; font-weight: 800; margin-bottom: 2rem;
    }
    .checkout__empty { text-align: center; padding: 3rem; color: var(--color-text-muted); }
    .btn-back {
      display: inline-block; margin-top: 1rem;
      padding: 0.75rem 2rem; background: var(--color-primary);
      color: white; text-decoration: none; border-radius: var(--radius-md);
    }

    .checkout__layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
    @media (max-width: 768px) { .checkout__layout { grid-template-columns: 1fr; } }

    .checkout__form h2, .checkout__summary h2 {
      font-family: var(--font-heading);
      font-size: 1.3rem; font-weight: 700; margin-bottom: 1.25rem;
    }

    .form-group { margin-bottom: 1rem; }
    .form-group label {
      display: block; font-weight: 600; font-size: 0.85rem;
      margin-bottom: 0.35rem;
    }
    .form-group input, .form-group textarea {
      width: 100%; padding: 0.7rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm); font-size: 0.95rem;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none; border-color: var(--color-primary);
    }
    .form-group .is-invalid { border-color: var(--color-error); }
    .form-group .is-invalid:focus { border-color: var(--color-error); box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .checkout__summary {
      background: var(--color-light);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      align-self: start;
      position: sticky; top: 1rem;
    }

    .summary-item {
      display: flex; gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--color-border);
    }
    .summary-item__img {
      width: 60px; height: 60px; object-fit: cover;
      border-radius: var(--radius-sm);
    }
    .summary-item__info { flex: 1; }
    .summary-item__name { font-size: 0.85rem; font-weight: 600; margin: 0 0 0.2rem; }
    .summary-item__variant { font-size: 0.75rem; color: var(--color-text-muted); margin: 0; }
    .summary-item__qty { font-size: 0.75rem; color: var(--color-text-muted); margin: 0.2rem 0 0; }
    .summary-item__price { font-weight: 700; }

    .summary-total {
      display: flex; justify-content: space-between;
      font-size: 1.2rem; padding: 1rem 0;
    }
    .summary-total strong { font-size: 1.4rem; }

    .btn-pay {
      width: 100%; padding: 1rem;
      background: var(--color-accent); color: white;
      border: none; border-radius: var(--radius-md);
      font-size: 1.1rem; font-weight: 700;
      cursor: pointer;
    }
    .btn-pay:hover:not(:disabled) { background: var(--color-accent-hover); }
    .btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }

    .checkout__secure {
      text-align: center; font-size: 0.8rem;
      color: var(--color-text-muted); margin-top: 0.75rem;
    }
    .checkout__error {
      background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;
      border-radius: var(--radius-md); padding: 0.75rem 1rem;
      margin-bottom: 1rem; font-size: 0.9rem;
    }
    .checkout__form-error {
      text-align: center; font-size: 0.8rem;
      color: var(--color-error); margin-top: 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  readonly cartStore = inject(CartStore);
  private shopService = inject(ShopService);
  private destroyRef = inject(DestroyRef);
  private title = inject(Title);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  readonly checkoutForm = this.fb.group({
    shippingName: ['', Validators.required],
    shippingEmail: ['', [Validators.required, Validators.email]],
    shippingPhone: [''],
    shippingAddress: ['', Validators.required],
    shippingCity: ['', Validators.required],
    shippingPostalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    shippingCountry: ['España'],
    notes: [''],
  });

  readonly isProcessing = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.title.setTitle(`Finalizar compra — ${environment.titleSuffix}`);
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid || this.isProcessing()) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');

    this.shopService.createCheckoutSession({
      sessionId: this.cartStore.sessionId(),
      form: this.checkoutForm.value as any,
    }).pipe(
      catchError((err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(err.error?.message || err.error?.error || 'Error al procesar el pago. Inténtalo de nuevo.');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      if (result?.url) {
        if (isPlatformBrowser(this.platformId)) {
          window.location.href = result.url;
        }
      } else if (result) {
        this.isProcessing.set(false);
        this.errorMessage.set((result as any).error || 'Error al crear la sesión de pago.');
      }
    });
  }
}
