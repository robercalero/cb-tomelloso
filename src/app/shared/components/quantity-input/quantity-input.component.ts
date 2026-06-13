import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-input',
  standalone: true,
  template: `
    <div class="quantity-input">
      <button class="qty-btn" (click)="decrement()"
              [disabled]="value() <= 1" type="button">&minus;</button>
      <span class="qty-value">{{ value() }}</span>
      <button class="qty-btn" (click)="increment()"
              [disabled]="value() >= max()" type="button">+</button>
    </div>
  `,
  styles: [`
    .quantity-input {
      display: inline-flex; align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md); overflow: hidden;
    }
    .qty-btn {
      width: 40px; height: 40px;
      border: none; background: var(--color-light);
      font-size: 1.1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 150ms ease;
    }
    .qty-btn:hover:not(:disabled) { background: var(--color-border); }
    .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .qty-value {
      width: 48px; text-align: center;
      font-weight: 600; font-size: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantityInputComponent {
  readonly value = input.required<number>();
  readonly max = input(999);
  readonly quantityChange = output<number>();

  decrement(): void {
    if (this.value() > 1) this.quantityChange.emit(this.value() - 1);
  }

  increment(): void {
    if (this.value() < this.max()) this.quantityChange.emit(this.value() + 1);
  }
}
