import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-size-selector',
  standalone: true,
  template: `
    <div class="size-selector">
      @for (size of sizes(); track size) {
        <button class="size-btn"
                [class.size-btn--active]="selected() === size"
                (click)="sizeSelected.emit(size)"
                type="button">
          {{ size }}
        </button>
      }
    </div>
  `,
  styles: [`
    .size-selector { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .size-btn {
      min-width: 44px; padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: white; font-size: 0.85rem;
      cursor: pointer; transition: all 150ms ease;
      text-align: center;
    }
    .size-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .size-btn--active {
      background: var(--color-primary); color: white;
      border-color: var(--color-primary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SizeSelectorComponent {
  readonly sizes = input.required<string[]>();
  readonly selected = input<string | null>(null);
  readonly sizeSelected = output<string>();
}
