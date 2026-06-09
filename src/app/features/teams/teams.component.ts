import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
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
    MatTableModule,
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

  readonly displayedColumns = ['pos', 'team', 'pj', 'pg', 'pp', 'pts'];

  readonly standings = [
    { pos: 1, team: 'CB La Roda', pj: 18, pg: 15, pp: 3, pts: 33 },
    { pos: 2, team: 'Baloncesto Alcázar', pj: 18, pg: 14, pp: 4, pts: 32 },
    { pos: 3, team: 'CB Puertollano', pj: 18, pg: 12, pp: 6, pts: 30 },
    { pos: 4, team: 'CB Villarrobledo', pj: 18, pg: 11, pp: 7, pts: 29 },
    { pos: 5, team: 'Val Brokers CB Tomelloso', pj: 18, pg: 10, pp: 8, pts: 28 },
    { pos: 6, team: 'CB Daimiel', pj: 18, pg: 8, pp: 10, pts: 26 }
  ];

  ngOnInit(): void {
    this.title.setTitle(`Equipos - ${environment.titleSuffix}`);
    this.meta.updateTag({ name: 'description', content: 'Conoce todos los equipos del Club Baloncesto Tomelloso: Senior Autonómica, Júnior y categorías base.' });
  }
}
