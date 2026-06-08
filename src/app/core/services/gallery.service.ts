import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface GalleryItem {
  id: number;
  teamId?: number;
  title?: string;
  mediaType: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  season?: string;
  eventName?: string;
  takenAt?: string;
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private api = inject(ApiService);

  getGallery(): Observable<GalleryItem[]> {
    return this.api.get<GalleryItem[]>('gallery').pipe(
      catchError(() => of([] as GalleryItem[]))
    );
  }

  readonly gallery = toSignal(this.getGallery(), { initialValue: [] as GalleryItem[] });
}
