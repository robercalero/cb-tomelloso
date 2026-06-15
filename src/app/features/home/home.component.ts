import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, effect, afterNextRender, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatchesService } from '../../core/services/matches.service';
import { NewsService } from '../../core/services/news.service';
import { SponsorsService } from '../../core/services/sponsors.service';
import { ShopService } from '../../core/services/shop.service';
import { CartStore } from '../../core/services/cart.store';
import { MatchCardComponent } from '../../shared/components/match-card/match-card.component';
import { NewsSliderComponent } from '../../shared/components/news-slider/news-slider.component';
import { HeroSlide } from '../../models/news.model';
import { SponsorCarouselComponent } from '../../shared/components/sponsor-carousel/sponsor-carousel.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatchCardComponent,
    NewsSliderComponent,
    SponsorCarouselComponent,
    SkeletonLoaderComponent,
    ProductCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private matchesService = inject(MatchesService);
  private newsService = inject(NewsService);
  private sponsorsService = inject(SponsorsService);
  private shopService = inject(ShopService);
  private cartStore = inject(CartStore);
  private platformId = inject(PLATFORM_ID);
  private title = inject(Title);
  private meta = inject(Meta);
  private destroyRef = inject(DestroyRef);

  private isBrowser = isPlatformBrowser(this.platformId);
  private deferredTimeouts: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const slides = this.heroSlides();
      const first = slides?.[0];
      if (!first?.imageUrl) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.fetchPriority = 'high';
      const sep = first.imageUrl.includes('?') ? '&' : '?';
      link.href = `${first.imageUrl}${sep}w=640`;
      document.head.appendChild(link);
    });
  }

  readonly upcomingMatches = this.matchesService.upcomingMatches;
  readonly recentResults = this.matchesService.recentResults;
  readonly heroSlides = this.newsService.heroSlides;
  readonly sponsors = this.sponsorsService.sponsors;
  readonly featuredProducts = this.shopService.featuredProducts;

  readonly stats = [
    { value: 40, label: 'Años de historia', icon: 'history' },
    { value: 150, label: 'Jugadores federados', icon: 'people' },
    { value: 12, label: 'Títulos', icon: 'emoji_events' },
    { value: 8, label: 'Equipos activos', icon: 'groups' }
  ];

  onSlideChanged(slide: HeroSlide): void {
  }

  onAddToCart(event: { productId: number; quantity: number }): void {
    this.cartStore.addItem(event.productId, event.quantity);
  }

  ngOnInit(): void {
    this.title.setTitle(`Inicio - ${environment.titleSuffix}`);
    this.meta.updateTag({
      name: 'description',
      content: 'Web oficial del Club Baloncesto Tomelloso (Val Brokers C.B. Tomelloso). Noticias, partidos, equipos y toda la información del club de Tomelloso, Ciudad Real.'
    });
    this.meta.updateTag({ property: 'og:title', content: `CB Tomelloso - ${environment.titleSuffix}` });

    // Critical - above the fold: fire immediately
    this.newsService.loadHeroSlides();
    this.shopService.loadFeaturedProducts();

    // Deferred: visible content just below hero
    this.deferredTimeouts.push(setTimeout(() => {
      this.matchesService.loadUpcomingMatches();
      this.matchesService.loadRecentResults();
    }, 500));

    // Deferred: below the fold
    this.deferredTimeouts.push(setTimeout(() => {
      this.sponsorsService.loadSponsors();
    }, 1500));

    this.destroyRef.onDestroy(() => {
      for (const t of this.deferredTimeouts) clearTimeout(t);
      this.deferredTimeouts.length = 0;
    });
  }
}
