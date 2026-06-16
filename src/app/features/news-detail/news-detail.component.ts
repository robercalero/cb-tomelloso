import { ChangeDetectionStrategy, Component, computed, inject, effect, OnInit, signal, DestroyRef, PLATFORM_ID, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap, catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { News, MediaItem } from '../../models/news.model';
import { environment } from '../../../environments/environment';
import { resolveApiUrl } from '../../core/utils/api-url.utils';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, MatIconModule, MatButtonModule],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private title = inject(Title);
  private meta = inject(Meta);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  readonly loading = signal(true);
  readonly notFound = signal(false);

  private readonly rawNews = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('slug') as string),
      switchMap(slug =>
        this.api.get<News>(`news/${slug}`).pipe(
          catchError(() => {
            this.notFound.set(true);
            this.loading.set(false);
            return of(null);
          }),
        )
      ),
    ),
    { initialValue: null }
  );

  readonly news = computed(() => {
    const n = this.rawNews();
    if (!n) return undefined;
    return {
      ...n,
      imageUrl: resolveApiUrl(n.imageUrl),
      media: n.media?.map(m => ({
        ...m,
        url: resolveApiUrl(m.url),
        thumbnail: m.thumbnail ? resolveApiUrl(m.thumbnail) : undefined,
      })) as MediaItem[] | undefined,
    };
  });

  readonly safeContent = computed(() => {
    const n = this.news();
    return n ? this.sanitizer.bypassSecurityTrustHtml(n.content) : '';
  });

  readonly lightboxIndex = signal<number | null>(null);
  readonly lightboxMedia = signal<MediaItem[]>([]);
  private previousActiveElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const n = this.news();
      if (n) {
        this.title.setTitle(`${n.title} - ${environment.titleSuffix}`);
        this.meta.updateTag({ name: 'description', content: n.excerpt });
        this.loading.set(false);
        this.notFound.set(false);
        if (n.media && n.media.length > 0) {
          this.lightboxMedia.set(n.media);
        }
        const slug = this.route.snapshot.paramMap.get('slug');
        if (slug && isPlatformBrowser(this.platformId)) {
          this.api.post(`news/${slug}/view`, {}).pipe(
            catchError(() => of(null)),
            takeUntilDestroyed(this.destroyRef),
          ).subscribe();
        }
      }
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading.set(false);
      this.notFound.set(true);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.lightboxIndex() !== null) {
      this.closeLightbox();
    }
  }

  openLightbox(index: number): void {
    this.previousActiveElement = isPlatformBrowser(this.platformId) ? document.activeElement as HTMLElement : null;
    this.lightboxIndex.set(index);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox(): void {
    this.lightboxIndex.set(null);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    setTimeout(() => this.previousActiveElement?.focus());
  }

  prevImage(): void {
    const idx = this.lightboxIndex();
    if (idx !== null && idx > 0) {
      this.lightboxIndex.set(idx - 1);
    }
  }

  nextImage(): void {
    const idx = this.lightboxIndex();
    const media = this.lightboxMedia();
    if (idx !== null && idx < media.length - 1) {
      this.lightboxIndex.set(idx + 1);
    }
  }

  trackMedia(_index: number, item: MediaItem): string {
    return item.url;
  }
}
