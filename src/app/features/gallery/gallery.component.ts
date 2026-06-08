import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, Title, Meta } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { GalleryService, GalleryItem } from '../../core/services/gallery.service';
import { InstagramService } from '../../core/services/instagram.service';
import { environment } from '../../../environments/environment';
import { resolveApiUrl } from '../../core/utils/api-url.utils';

interface GalleryImage {
  id: number;
  src: string;
  title: string;
  category: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);
  private sanitizer = inject(DomSanitizer);
  private galleryService = inject(GalleryService);
  private instagramService = inject(InstagramService);

  readonly selectedCategory = signal<string>('todas');
  readonly selectedImage = signal<GalleryImage | null>(null);

  readonly categories = ['todas', 'equipos', 'partidos', 'eventos', 'entrenamientos'];

  readonly galleryItems = toSignal(
    this.galleryService.getGallery(),
    { initialValue: [] as GalleryItem[] }
  );

  readonly gallery = computed(() =>
    this.galleryItems().map(item => ({
      id: item.id,
      src: resolveApiUrl(item.url),
      title: item.title || item.eventName || '',
      category: this.mapCategory(item),
    }))
  );

  readonly filteredGallery = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'todas') return this.gallery();
    return this.gallery().filter(img => img.category === cat);
  });

  private mapCategory(item: GalleryItem): string {
    if (item.eventName) {
      const name = item.eventName.toLowerCase();
      if (name.includes('partido') || name.includes('encuentro')) return 'partidos';
      if (name.includes('entrena') || name.includes('escuela')) return 'entrenamientos';
      if (name.includes('presentación') || name.includes('equipo')) return 'equipos';
      if (name.includes('torneo') || name.includes('copa') || name.includes('solidario') || name.includes('fiesta') || name.includes('homenaje')) return 'eventos';
    }
    if (item.teamId) return 'equipos';
    return 'eventos';
  }

  readonly videos = computed(() =>
    this.galleryItems().filter(item => item.mediaType === 'video').map(v => ({
      id: `v-${v.id}`,
      title: v.title || v.eventName || '',
      embedUrl: v.url,
    }))
  );

  readonly safeVideoUrl = computed(() =>
    this.videos().reduce((acc, v) => {
      acc[v.id] = this.sanitizer.bypassSecurityTrustResourceUrl(v.embedUrl);
      return acc;
    }, {} as Record<string, any>)
  );

  readonly instagramPosts = computed(() =>
    this.instagramService.instagramNews().map(n => ({
      id: n.id,
      src: resolveApiUrl(n.imageUrl || ''),
      title: n.title,
      caption: n.excerpt,
      slug: n.slug,
      sourceUrl: n.sourceUrl || '',
      date: n.publishedAt || null,
      mediaCount: n.media?.length || 1,
    }))
  );

  readonly gradientColors = [
    'linear-gradient(135deg, #D4A017, #E8B830)',
    'linear-gradient(135deg, #1B8A3D, #27AE60)',
    'linear-gradient(135deg, #D4A017, #1B8A3D)',
    'linear-gradient(135deg, #B8890F, #D4A017)',
    'linear-gradient(135deg, #1B8A3D, #D4A017)',
    'linear-gradient(135deg, #D4A017, #B8890F)'
  ];

  ngOnInit(): void {
    this.title.setTitle(`Galería - ${environment.titleSuffix}`);
    this.meta.updateTag({ name: 'description', content: 'Galería de imágenes y vídeos del Club Baloncesto Tomelloso.' });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.selectedImage.set(null);
  }

  openLightbox(image: GalleryImage): void {
    this.selectedImage.set(image);
  }

  closeLightbox(): void {
    this.selectedImage.set(null);
  }
}
