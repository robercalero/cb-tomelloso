import { Injectable, inject, computed, signal, DestroyRef } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { News, HeroSlide } from '../../models/news.model';
import { resolveApiUrl, isValidImageUrl } from '../utils/api-url.utils';

function mapToHeroSlides(news: News[]): HeroSlide[] {
  return news
    .filter(n => n.imageUrl && n.isPublished)
    .sort((a, b) =>
      new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    )
    .slice(0, 6)
    .map(n => {
      const resolved = resolveApiUrl(n.imageUrl!);
      return {
        id: n.id,
        title: n.title,
        excerpt: n.excerpt,
        imageUrl: isValidImageUrl(resolved) ? resolved : '',
        category: n.category,
        publishedAt: n.publishedAt || null,
        slug: n.slug,
        source: n.source,
        sourceUrl: n.sourceUrl,
      };
    });
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  private _heroSlides = signal<News[]>([]);

  readonly heroSlides = computed<HeroSlide[]>(() => mapToHeroSlides(this._heroSlides()));

  loadHeroSlides(): void {
    this.api.get<News[]>('news/hero').pipe(
      catchError(() => of([] as News[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(s => this._heroSlides.set(s));
  }
}
