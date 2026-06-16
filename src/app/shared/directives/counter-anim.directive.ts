import { Directive, ElementRef, Renderer2, effect, inject, input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appCounterAnim]',
  standalone: true
})
export class CounterAnimDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  readonly targetValue = input(0);
  readonly duration = input(2000);

  private previousTarget = 0;

  constructor() {
    effect(() => {
      const target = this.targetValue();
      if (target === 0 || !isPlatformBrowser(this.platformId)) return;
      if (target === this.previousTarget) return;
      this.previousTarget = target;
      this.animateCount(target);
    });
  }

  private animateCount(target: number): void {
    const startTime = performance.now();
    const startValue = 0;

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration(), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * eased);

      this.renderer.setProperty(this.el.nativeElement, 'textContent', current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        this.renderer.setProperty(this.el.nativeElement, 'textContent', target);
      }
    };

    requestAnimationFrame(update);
  }
}
