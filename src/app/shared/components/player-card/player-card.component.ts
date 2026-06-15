import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Player } from '../../../models/player.model';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerCardComponent {
  readonly player = input.required<Player>();
}
