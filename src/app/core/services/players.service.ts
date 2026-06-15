import { Injectable, inject, computed, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Player } from '../../models/player.model';
import { Team } from '../../models/team.model';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private api = inject(ApiService);

  private _players = signal<Player[]>([]);
  private _teams = signal<Team[]>([]);

  readonly players = this._players.asReadonly();
  readonly teams = this._teams.asReadonly();

  readonly seniorAutoTeam = computed(() =>
    this.teams().find(t => t.category === 'Senior Autonómica')
  );

  readonly juniorTeams = computed(() =>
    this.teams().filter(t => t.category === 'Junior U19')
  );

  readonly baseTeam = computed(() =>
    this.teams().find(t => t.category === 'Minibasket')
  );

  getPlayersByTeam(teamId: number): Player[] {
    return this.players().filter(p => p.teamId === teamId);
  }

  loadPlayers(): void {
    this.api.get<Player[]>('players').pipe(
      catchError(() => of(this._players()))
    ).subscribe(p => this._players.set(p));
  }

  loadTeams(): void {
    this.api.get<Team[]>('teams').pipe(
      catchError(() => of(this._teams()))
    ).subscribe(t => this._teams.set(t));
  }
}
