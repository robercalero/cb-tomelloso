import { Injectable, inject, signal } from '@angular/core';
import { of, timer } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Sponsor } from '../../models/sponsor.model';

const RETRY_DELAYS = [5000, 10000, 15000];

@Injectable({ providedIn: 'root' })
export class SponsorsService {
  private api = inject(ApiService);

  private _sponsors = signal<Sponsor[]>([]);

  readonly sponsors = this._sponsors.asReadonly();

  loadSponsors(): void {
    this.api.get<Sponsor[]>('sponsors').pipe(
      retry({
        count: 3,
        delay: (_, retryCount) => timer(RETRY_DELAYS[retryCount - 1] ?? 15000),
      }),
      catchError(() => of(this._sponsors()))
    ).subscribe(s => this._sponsors.set(s));
  }
}
