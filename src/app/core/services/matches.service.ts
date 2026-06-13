import { Injectable, inject, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Match } from '../../models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private api = inject(ApiService);

  private _cachedMatches = signal<Match[]>([]);

  readonly matches = toSignal(
    this.api.get<Match[]>('matches').pipe(
      tap(m => this._cachedMatches.set(m)),
      catchError(() => of(this._cachedMatches()))
    ),
    { initialValue: [] as Match[] }
  );

  private _cachedUpcoming = signal<Match[]>([]);

  readonly upcomingMatches = toSignal(
    this.api.get<Match[]>('matches/upcoming').pipe(
      tap(m => this._cachedUpcoming.set(m)),
      catchError(() => of(this._cachedUpcoming()))
    ),
    { initialValue: [] as Match[] }
  );

  private _cachedResults = signal<Match[]>([]);

  readonly recentResults = toSignal(
    this.api.get<Match[]>('matches/results').pipe(
      tap(m => this._cachedResults.set(m)),
      catchError(() => of(this._cachedResults()))
    ),
    { initialValue: [] as Match[] }
  );

  readonly homeMatches = computed(() =>
    this.matches().filter(m => m.isHome)
  );

  readonly awayMatches = computed(() =>
    this.matches().filter(m => !m.isHome)
  );
}
