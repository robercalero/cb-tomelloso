import { Injectable, inject, computed, signal, DestroyRef } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { Player } from '../../models/player.model';
import { Team } from '../../models/team.model';

export const TEAM_CATEGORIES = {
  SENIOR: 'Senior Autonómica',
  JUNIOR: 'Junior U19',
  BASE: 'Minibasket',
} as const;

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  private _players = signal<Player[]>([]);
  private _teams = signal<Team[]>([]);

  readonly players = this._players.asReadonly();
  readonly teams = this._teams.asReadonly();

  readonly seniorAutoTeam = computed(() =>
    this.teams().find(t => t.category === TEAM_CATEGORIES.SENIOR)
  );

  readonly juniorTeams = computed(() =>
    this.teams().filter(t => t.category === TEAM_CATEGORIES.JUNIOR)
  );

  readonly baseTeam = computed(() =>
    this.teams().find(t => t.category === TEAM_CATEGORIES.BASE)
  );

  getPlayersByTeam(teamId: number): Player[] {
    return this.players().filter(p => p.teamId === teamId);
  }

  loadPlayers(): void {
    this.api.get<Player[]>('players').pipe(
      catchError(() => of([] as Player[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(p => this._players.set(p));
  }

  loadTeams(): void {
    this.api.get<Team[]>('teams').pipe(
      catchError(() => of([] as Team[])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(t => this._teams.set(t));
  }
}
