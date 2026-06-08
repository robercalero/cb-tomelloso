import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Match } from '../../../models/match.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchCardComponent {
  readonly match = input.required<Match>();
  readonly onMatchClick = output<Match>();

  readonly isHomeWin = computed(() => {
    const m = this.match();
    if (m.status !== 'finished' || m.scoreHome == null || m.scoreAway == null) return false;
    return m.isHome ? m.scoreHome > m.scoreAway : m.scoreAway > m.scoreHome;
  });

  handleClick(): void {
    this.onMatchClick.emit(this.match());
  }
}
