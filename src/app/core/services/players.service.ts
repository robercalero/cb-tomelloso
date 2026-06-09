import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Player } from '../../models/player.model';
import { Team } from '../../models/team.model';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  private api = inject(ApiService);

  readonly players = toSignal(
    this.api.get<Player[]>('players').pipe(catchError(() => of([] as Player[]))),
    { initialValue: [] as Player[] }
  );

  readonly teams = toSignal(
    this.api.get<Team[]>('teams').pipe(catchError(() => of([] as Team[]))),
    { initialValue: [] as Team[] }
  );

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
}
