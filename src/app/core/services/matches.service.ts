import { Injectable, inject, computed, signal, DestroyRef } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { Match } from '../../models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  private _matches = signal<Match[]>([]);
  private _upcomingMatches = signal<Match[]>([]);
  private _recentResults = signal<Match[]>([]);

  readonly matches = this._matches.asReadonly();
  readonly upcomingMatches = this._upcomingMatches.asReadonly();
  readonly recentResults = this._recentResults.asReadonly();

  readonly homeMatches = computed(() =>
    this.matches().filter(m => m.isHome)
  );

  readonly awayMatches = computed(() =>
    this.matches().filter(m => !m.isHome)
  );

  loadMatches(): void {
    this.api.get<Match[]>('matches').pipe(
      catchError(() => of([] as Match[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(m => this._matches.set(m));
  }

  loadUpcomingMatches(): void {
    this.api.get<Match[]>('matches/upcoming').pipe(
      catchError(() => of([] as Match[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(m => this._upcomingMatches.set(m));
  }

  loadRecentResults(): void {
    this.api.get<Match[]>('matches/results').pipe(
      catchError(() => of([] as Match[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(m => this._recentResults.set(m));
  }
}
