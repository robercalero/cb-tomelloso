import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { PlayersService } from '../../core/services/players.service';
import { PlayerCardComponent } from '../../shared/components/player-card/player-card.component';
import { MatchCardComponent } from '../../shared/components/match-card/match-card.component';
import { MatchesService } from '../../core/services/matches.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    PlayerCardComponent,
    MatchCardComponent
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsComponent implements OnInit {
  private playersService = inject(PlayersService);
  private matchesService = inject(MatchesService);
  private title = inject(Title);
  private meta = inject(Meta);

  readonly teams = this.playersService.teams;
  readonly recentResults = this.matchesService.recentResults;
  readonly activeTab = signal(0);

  readonly teamTabs = ['Senior Autonómica', 'Júnior', 'Categorías Base'];

  readonly seniorTeams = computed(() =>
    this.teams().filter(t => t.category === 'Senior Autonómica')
  );
  readonly juniorTeams = computed(() =>
    this.teams().filter(t => t.category === 'Junior U19')
  );
  readonly baseTeams = computed(() =>
    this.teams().filter(t => t.category === 'Minibasket')
  );

  readonly tabTeams = computed(() => [
    this.seniorTeams(),
    this.juniorTeams(),
    this.baseTeams(),
  ]);

  readonly regularSeasonRounds = Array.from({ length: 14 }, (_, i) => ({
    round: i + 1,
    url: `https://fbclm.net/pagina-de-grupo/?id=952&round=${14 - i}`
  }));

  readonly classificationUrl = 'https://fbclm.net/pagina-de-grupo/?id=952';
  readonly ascensoUrl = 'https://fbclm.net/pagina-de-grupo/?id=1019';

  ngOnInit(): void {
    this.title.setTitle(`Equipos - ${environment.titleSuffix}`);
    this.meta.updateTag({ name: 'description', content: 'Conoce todos los equipos del Club Baloncesto Tomelloso: Senior Autonómica, Júnior y categorías base.' });

    this.matchesService.loadRecentResults();
    this.playersService.loadPlayers();
    this.playersService.loadTeams();
  }
}
