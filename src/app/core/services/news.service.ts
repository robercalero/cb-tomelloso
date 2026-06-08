import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { News, NewsListResponse, HeroSlide } from '../../models/news.model';
import { resolveApiUrl } from '../utils/api-url.utils';

function mapToHeroSlides(news: News[]): HeroSlide[] {
  return news
    .filter(n => n.imageUrl && n.isPublished)
    .sort((a, b) =>
      new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    )
    .slice(0, 6)
    .map(n => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt,
      imageUrl: resolveApiUrl(n.imageUrl!),
      category: n.category,
      publishedAt: n.publishedAt || null,
      slug: n.slug,
      source: n.source,
      sourceUrl: n.sourceUrl,
    }));
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private api = inject(ApiService);

  readonly newsResponse = toSignal(
    this.api.get<NewsListResponse>('news', { page: 1, limit: 10 }).pipe(
      catchError(() => of({ data: [] as News[], total: 0, page: 1, limit: 10 }))
    ),
    { initialValue: { data: [] as News[], total: 0, page: 1, limit: 10 } }
  );

  readonly news = computed(() => this.newsResponse().data);
  readonly totalNews = computed(() => this.newsResponse().total);

  readonly heroSlidesResponse = toSignal(
    this.api.get<News[]>('news/hero').pipe(
      catchError(() => of([] as News[]))
    ),
    { initialValue: [] as News[] }
  );

  readonly latestNews = computed(() =>
    [...this.news()].sort((a, b) =>
      new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    ).slice(0, 3)
  );

  readonly clubNews = computed(() =>
    this.news().filter(n => n.category === 'club')
  );

  readonly heroSlides = computed<HeroSlide[]>(() => mapToHeroSlides(this.heroSlidesResponse()));

  readonly resultsNews = computed(() =>
    this.news().filter(n => n.category === 'resultado')
  );

  private newsCache = new Map<string, News>();

  getBySlug(slug: string): Observable<News> {
    const cached = this.newsCache.get(slug);
    if (cached) {
      return of(cached);
    }
    return this.api.get<News>(`news/${slug}`).pipe(
      tap(result => this.newsCache.set(slug, result)),
      catchError(() => of(null as unknown as News))
    );
  }
}
