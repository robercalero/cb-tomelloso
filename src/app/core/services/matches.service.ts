import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Match } from '../../models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private api = inject(ApiService);

  readonly matches = toSignal(
    this.api.get<Match[]>('matches').pipe(catchError(() => of([] as Match[]))),
    { initialValue: [] as Match[] }
  );

  readonly upcomingMatches = toSignal(
    this.api.get<Match[]>('matches/upcoming').pipe(catchError(() => of([] as Match[]))),
    { initialValue: [] as Match[] }
  );

  readonly recentResults = toSignal(
    this.api.get<Match[]>('matches/results').pipe(catchError(() => of([] as Match[]))),
    { initialValue: [] as Match[] }
  );

  readonly homeMatches = computed(() =>
    this.matches().filter(m => m.isHome)
  );

  readonly awayMatches = computed(() =>
    this.matches().filter(m => !m.isHome)
  );
}
