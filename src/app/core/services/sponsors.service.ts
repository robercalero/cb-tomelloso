import { Injectable, inject, signal, isDevMode } from '@angular/core';
import { of, timer } from 'rxjs';
import { tap, retry, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Sponsor } from '../../models/sponsor.model';

const RETRY_DELAYS = [5000, 10000, 15000];
const CACHE_KEY = 'cbt_sponsors';

@Injectable({ providedIn: 'root' })
export class SponsorsService {
  private api = inject(ApiService);

  private _sponsors = signal<Sponsor[]>([]);

  readonly sponsors = this._sponsors.asReadonly();

  loadSponsors(): void {
    const cached = this.loadFromCache();
    if (cached) {
      this._sponsors.set(cached);
    }

    this.api.get<Sponsor[]>('sponsors').pipe(
      retry({
        count: 3,
        delay: (_, retryCount) => timer(RETRY_DELAYS[retryCount - 1] ?? 15000),
      }),
      tap(s => this.saveToCache(s)),
      catchError(() => of(this._sponsors()))
    ).subscribe(s => this._sponsors.set(s));
  }

  private loadFromCache(): Sponsor[] | null {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Sponsor[];
    } catch {
      return null;
    }
  }

  private saveToCache(sponsors: Sponsor[]): void {
    try {
      if (typeof sessionStorage === 'undefined') return;
      if (!isDevMode()) sessionStorage.setItem(CACHE_KEY, JSON.stringify(sponsors));
    } catch {
      // localStorage may be full
    }
  }
}
