import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Player } from '../../../models/player.model';

@Component({
  selector: 'app-player-card',
  standalone: true,
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerCardComponent {
  readonly player = input.required<Player>();
}
