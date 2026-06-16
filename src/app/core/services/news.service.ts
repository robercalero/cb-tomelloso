import { Injectable, inject, computed, signal, DestroyRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { News, NewsListResponse, HeroSlide } from '../../models/news.model';
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

  private _newsResponse = signal<NewsListResponse>({ data: [], total: 0, page: 1, limit: 10 });
  private _heroSlides = signal<News[]>([]);

  readonly news = computed(() => this._newsResponse().data);
  readonly totalNews = computed(() => this._newsResponse().total);

  readonly latestNews = computed(() =>
    [...this.news()].sort((a, b) =>
      new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    ).slice(0, 3)
  );

  readonly clubNews = computed(() =>
    this.news().filter(n => n.category === 'club')
  );

  readonly heroSlides = computed<HeroSlide[]>(() => mapToHeroSlides(this._heroSlides()));

  readonly resultsNews = computed(() =>
    this.news().filter(n => n.category === 'resultado')
  );

  private newsCache = new Map<string, News>();
  private readonly CACHE_MAX = 50;

  private cacheNews(slug: string, news: News): void {
    if (this.newsCache.size >= this.CACHE_MAX) {
      const firstKey = this.newsCache.keys().next().value;
      if (firstKey !== undefined) this.newsCache.delete(firstKey);
    }
    this.newsCache.set(slug, news);
  }

  loadNews(): void {
    this.api.get<NewsListResponse>('news', { page: 1, limit: 10 }).pipe(
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(r => this._newsResponse.set(r));
  }

  loadHeroSlides(): void {
    this.api.get<News[]>('news/hero').pipe(
      catchError(() => of([] as News[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(s => this._heroSlides.set(s));
  }

  getBySlug(slug: string): Observable<News | null> {
    const cached = this.newsCache.get(slug);
    if (cached) {
      return of(cached);
    }
    return this.api.get<News>(`news/${slug}`).pipe(
      tap(result => this.cacheNews(slug, result)),
      catchError(() => of(null))
    );
  }
}
