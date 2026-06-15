import { Injectable, inject, computed, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Match } from '../../models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private api = inject(ApiService);

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
      catchError(() => of(this._matches()))
    ).subscribe(m => this._matches.set(m));
  }

  loadUpcomingMatches(): void {
    this.api.get<Match[]>('matches/upcoming').pipe(
      catchError(() => of(this._upcomingMatches()))
    ).subscribe(m => this._upcomingMatches.set(m));
  }

  loadRecentResults(): void {
    this.api.get<Match[]>('matches/results').pipe(
      catchError(() => of(this._recentResults()))
    ).subscribe(m => this._recentResults.set(m));
  }
}
