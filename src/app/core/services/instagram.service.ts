import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { News, NewsListResponse } from '../../models/news.model';

export interface InstagramPost {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string | undefined;
  sourceUrl: string;
  publishedAt: string | undefined;
}

@Injectable({ providedIn: 'root' })
export class InstagramService {
  private api = inject(ApiService);

  getPosts(): Observable<News[]> {
    return this.api.get<NewsListResponse>('news', { source: 'instagram', limit: 50 }).pipe(
      map(res => res.data),
      catchError(() => of([] as News[]))
    );
  }

  readonly instagramNews = toSignal(this.getPosts(), { initialValue: [] as News[] });
}
