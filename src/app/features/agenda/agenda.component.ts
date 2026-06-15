import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
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

  readonly matches = this.matchesService.matches;
  readonly upcomingMatches = this.matchesService.upcomingMatches;
  readonly recentResults = this.matchesService.recentResults;

  readonly viewMode = signal<ViewMode>('list');
  readonly filterTeam = signal<string | null>(null);

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

  readonly calendarDays = signal(this.generateCalendarDays());

  private generateCalendarDays(): number[] {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  get currentMonthYear(): string {
    const now = new Date();
    return `${this.monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }

  getMatchesForDay(day: number): Match[] {
    return this.matches().filter(m => {
      const date = new Date(m.matchDate);
      return date.getDate() === day &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
    });
  }
}
