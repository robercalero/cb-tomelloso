import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, input, output,
  signal, computed, inject, DestroyRef, afterNextRender, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, NgClass, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroSlide, NewsSource } from '../../../models/news.model';

@Component({
  selector: 'app-news-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './news-slider.component.html',
  styleUrl: './news-slider.component.scss',
})
export class NewsSliderComponent implements OnInit, OnDestroy {
  slides = input.required<HeroSlide[]>();
  autoplay = input<boolean>(true);
  interval = input<number>(6000);
  transition = input<number>(700);
  pauseOnHover = input<boolean>(true);

  slideChanged = output<HeroSlide>();

  readonly activeIndex = signal<number>(0);
  readonly isTransitioning = signal<boolean>(false);
  readonly isPaused = signal<boolean>(false);
  readonly isLoaded = signal<boolean>(false);
  readonly imageErrors = signal<Set<number>>(new Set());

  readonly activeSlide = computed<HeroSlide | null>(() => {
    const s = this.slides();
    return s.length > 0 ? s[this.activeIndex()] : null;
  });

  readonly totalSlides = computed(() => this.slides().length);
  readonly canNavigate = computed(() => this.totalSlides() > 1);
  readonly visibleIndex = computed(() => this.activeIndex() + 1);

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private touchEndX = 0;

  constructor() {
    afterNextRender(() => {
      this.isLoaded.set(true);
      if (this.autoplay()) this.startAutoplay();
    });
    this.destroyRef.onDestroy(() => this.stopAutoplay());
  }

  ngOnInit(): void { }
  ngOnDestroy(): void { this.stopAutoplay(); }

  goTo(index: number): void {
    if (this.isTransitioning() || index === this.activeIndex()) return;
    this.isTransitioning.set(true);
    this.activeIndex.set((index + this.totalSlides()) % this.totalSlides());
    const slide = this.activeSlide();
    if (slide) this.slideChanged.emit(slide);
    setTimeout(() => this.isTransitioning.set(false), this.transition());
  }

  next(): void {
    this.goTo(this.activeIndex() + 1);
    if (this.autoplay()) this.restartAutoplay();
  }

  prev(): void {
    this.goTo(this.activeIndex() - 1);
    if (this.autoplay()) this.restartAutoplay();
  }

  startAutoplay(): void {
    if (!this.isBrowser || !this.canNavigate()) return;
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      if (!this.isPaused()) this.goTo(this.activeIndex() + 1);
    }, this.interval());
  }

  stopAutoplay(): void {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  restartAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }

  onMouseEnter(): void {
    if (this.pauseOnHover()) this.isPaused.set(true);
  }

  onMouseLeave(): void {
    if (this.pauseOnHover()) this.isPaused.set(false);
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].clientX;
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? this.next() : this.prev();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft': this.prev(); event.preventDefault(); break;
      case 'ArrowRight': this.next(); event.preventDefault(); break;
      case 'Home': this.goTo(0); event.preventDefault(); break;
      case 'End': this.goTo(this.totalSlides() - 1); event.preventDefault(); break;
    }
  }

  getSlideClasses(index: number): Record<string, boolean> {
    const active = this.activeIndex();
    const total = this.totalSlides();
    return {
      'slider__slide--active': index === active,
      'slider__slide--prev': index === (active - 1 + total) % total,
      'slider__slide--next': index === (active + 1) % total,
    };
  }

  getSourceIcon(source: NewsSource | undefined): string {
    const icons: Record<NewsSource, string> = {
      instagram: '📸',
      twitter: '🐦',
      facebook: '📘',
      youtube: '▶️',
      web: '🌐',
    };
    return source ? icons[source] : '';
  }

  getLcpUrl(url: string | null | undefined): string | null {
    if (!url || url === '?w=640') return null;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}w=640`;
  }

  getSrcset(url: string | null): string | null {
    if (!url) return null;
    const clean = url.replace(/^\uFEFF/, '').trim();
    if (!clean) return null;
    const separator = clean.includes('?') ? '&' : '?';
    return [640, 1024, 1600].map(w => `${clean}${separator}w=${w} ${w}w`).join(', ');
  }

  getSizes(): string {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1600px';
  }

  getSourceLabel(source: NewsSource | undefined): string {
    const labels: Record<NewsSource, string> = {
      instagram: 'Instagram',
      twitter: 'Twitter / X',
      facebook: 'Facebook',
      youtube: 'YouTube',
      web: 'Web oficial',
    };
    return source ? labels[source] : '';
  }

  onImageError(slideId: number): void {
    this.imageErrors.update(set => {
      if (set.has(slideId)) return set;
      const next = new Set(set);
      next.add(slideId);
      return next;
    });
  }

  trackBySlide(_: number, slide: HeroSlide): number {
    return slide.id;
  }
}
