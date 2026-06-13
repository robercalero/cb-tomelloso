import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Sponsor } from '../../models/sponsor.model';

@Injectable({ providedIn: 'root' })
export class SponsorsService {
  private api = inject(ApiService);

  private _cachedSponsors = signal<Sponsor[]>([]);

  readonly sponsors = toSignal(
    this.api.get<Sponsor[]>('sponsors').pipe(
      tap(s => this._cachedSponsors.set(s)),
      catchError(() => of(this._cachedSponsors()))
    ),
    { initialValue: [] as Sponsor[] }
  );
}
