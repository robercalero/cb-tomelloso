import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-container">
      <h1>404</h1>
      <p>La página que buscas no existe.</p>
      <a routerLink="/" class="btn btn-primary">Volver al inicio</a>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 6rem;
      margin: 0;
      color: var(--color-primary, #1a3a5c);
    }
    p {
      font-size: 1.25rem;
      margin: 1rem 0 2rem;
      color: #666;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
