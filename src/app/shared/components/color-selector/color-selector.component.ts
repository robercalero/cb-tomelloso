import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { ProductColor } from '../../../models/shop.model';

@Component({
  selector: 'app-color-selector',
  standalone: true,
  template: `
    <div class="color-selector">
      @for (color of colors(); track color.name) {
        <button class="color-btn"
                [class.color-btn--active]="selected()?.name === color.name"
                (click)="colorSelected.emit(color)"
                [title]="color.name"
                type="button">
          <span class="color-swatch" [style.background]="color.hex"></span>
          <span class="color-name">{{ color.name }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .color-selector { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .color-btn {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: white; cursor: pointer;
      transition: all 150ms ease; font-size: 0.85rem;
    }
    .color-btn:hover { border-color: var(--color-primary); }
    .color-btn--active { border-color: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary); }
    .color-swatch {
      width: 16px; height: 16px; border-radius: 50%;
      display: inline-block; border: 1px solid rgba(0,0,0,0.1);
      flex-shrink: 0;
    }
    .color-name { font-size: 0.85rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorSelectorComponent {
  readonly colors = input.required<ProductColor[]>();
  readonly selected = input<ProductColor | null>(null);
  readonly colorSelected = output<ProductColor>();
}
