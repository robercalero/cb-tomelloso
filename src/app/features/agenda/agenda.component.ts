import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatchesService } from '../../core/services/matches.service';
import { MatchCardComponent } from '../../shared/components/match-card/match-card.component';
import { Match } from '../../models/match.model';
import { environment } from '../../../environments/environment';

type ViewMode = 'list' | 'calendar';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatchCardComponent
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaComponent implements OnInit {
  private matchesService = inject(MatchesService);
  private title = inject(Title);
  private meta = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  readonly matches = this.matchesService.matches;
  readonly upcomingMatches = this.matchesService.upcomingMatches;
  readonly recentResults = this.matchesService.recentResults;

  readonly viewMode = signal<ViewMode>('list');
  readonly filterTeam = signal<string | null>(null);
  readonly loadingUpcoming = signal(true);
  readonly loadingResults = signal(true);
  readonly loadingAll = signal(true);
  private upcomingResolved = false;
  private resultsResolved = false;
  private allResolved = false;

  readonly competitionTypes = ['Todas', '1ª Autonómica CLM', 'Copa CLM'];

  ngOnInit(): void {
    this.title.setTitle(`Agenda / Partidos - ${environment.titleSuffix}`);
    this.meta.updateTag({ name: 'description', content: 'Calendario de partidos del Club Baloncesto Tomelloso. Próximos encuentros y resultados.' });

    this.matchesService.loadMatches();
    this.matchesService.loadUpcomingMatches();
    this.matchesService.loadRecentResults();
  }

  readonly monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  readonly calendarDays = signal<number[]>([]);

  private generateCalendarDays(): number[] {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  get currentMonthYear(): string {
    const now = isPlatformBrowser(this.platformId) ? new Date() : new Date(2024, 0, 1);
    return `${this.monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }

  getMatchesForDay(day: number): Match[] {
    return this.matches().filter(m => {
      const date = new Date(m.matchDate);
      const ref = isPlatformBrowser(this.platformId) ? new Date() : new Date(2024, 0, 1);
      return date.getDate() === day &&
        date.getMonth() === ref.getMonth() &&
        date.getFullYear() === ref.getFullYear();
    });
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.calendarDays.set(this.generateCalendarDays());
    }
    effect(() => {
      this.upcomingMatches();
      if (!this.upcomingResolved) {
        this.upcomingResolved = true;
        return;
      }
      this.loadingUpcoming.set(false);
    });
    effect(() => {
      this.recentResults();
      if (!this.resultsResolved) {
        this.resultsResolved = true;
        return;
      }
      this.loadingResults.set(false);
    });
    effect(() => {
      this.matches();
      if (!this.allResolved) {
        this.allResolved = true;
        return;
      }
      this.loadingAll.set(false);
    });
  }
}
