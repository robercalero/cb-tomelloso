import { ChangeDetectionStrategy, Component, computed, inject, effect, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
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

  readonly loading = signal(true);
  readonly notFound = signal(false);

  private readonly rawNews = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('slug') as string),
      switchMap(slug => this.api.get<News>(`news/${slug}`)),
    )
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

  readonly lightboxIndex = signal<number | null>(null);
  readonly lightboxMedia = signal<MediaItem[]>([]);

  private slug = this.route.snapshot.params['slug'];

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
      }
    });
  }

  ngOnInit(): void {
    if (!this.slug) {
      this.loading.set(false);
      this.notFound.set(true);
    }
  }

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxIndex.set(null);
    document.body.style.overflow = '';
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
