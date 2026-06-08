import { Directive, ElementRef, Input, effect, inject, signal } from '@angular/core';

@Directive({
  selector: '[appCounterAnim]',
  standalone: true
})
export class CounterAnimDirective {
  private el = inject(ElementRef);

  @Input({ required: true }) targetValue = signal(0);
  @Input() duration = 2000;

  private animated = false;

  constructor() {
    effect(() => {
      const target = this.targetValue();
      if (target === 0 || this.animated) return;
      this.animateCount(target);
      this.animated = true;
    });
  }

  private animateCount(target: number): void {
    const startTime = performance.now();
    const startValue = 0;

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * eased);

      this.el.nativeElement.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        this.el.nativeElement.textContent = target;
      }
    };

    requestAnimationFrame(update);
  }
}
