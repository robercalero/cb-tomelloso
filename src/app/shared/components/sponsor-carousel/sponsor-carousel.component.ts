import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Sponsor } from '../../../models/sponsor.model';

@Component({
  selector: 'app-sponsor-carousel',
  standalone: true,
  templateUrl: './sponsor-carousel.component.html',
  styleUrl: './sponsor-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsorCarouselComponent {
  readonly sponsors = input.required<Sponsor[]>();
}
