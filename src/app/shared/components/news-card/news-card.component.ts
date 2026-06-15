import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { News } from '../../../models/news.model';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [DatePipe, RouterLink, NgOptimizedImage],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsCardComponent {
  readonly news = input.required<News>();
  readonly onNewsClick = output<News>();
}
