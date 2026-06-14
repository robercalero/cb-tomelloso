import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="login-page">
      <form class="login-form" (submit)="login(); $event.preventDefault()">
        <h1>Panel de Administración</h1>
        <p class="login-form__sub">CB Tomelloso</p>

        @if (error()) {
          <div class="login-form__error">{{ error() }}</div>
        }

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" [value]="email()" (input)="email.set($any($event.target).value)" required placeholder="admin@cbtomelloso.es" />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input id="password" type="password" [value]="password()" (input)="password.set($any($event.target).value)" required placeholder="••••••" />
        </div>

        <button type="submit" class="btn-submit" [disabled]="loading()">
          {{ loading() ? 'Entrando...' : 'Acceder' }}
        </button>

        <a routerLink="/" class="login-form__back">← Volver a la web</a>
      </form>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1a5276, #1e8449); padding: 1rem;
    }
    .login-form {
      background: white; padding: 2.5rem; border-radius: 12px;
      width: 100%; max-width: 400px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .login-form h1 { font-family: var(--font-heading); font-weight: 800; margin: 0 0 0.25rem; }
    .login-form__sub { color: var(--color-text-muted); margin: 0 0 1.5rem; font-size: 0.9rem; }
    .login-form__error {
      background: #fde8e8; color: #c0392b; padding: 0.75rem;
      border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem;
    }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.3rem; }
    .form-group input {
      width: 100%; padding: 0.7rem 0.75rem; border: 1px solid var(--color-border);
      border-radius: 6px; font-size: 0.95rem;
    }
    .btn-submit {
      width: 100%; padding: 0.85rem; background: #1a5276; color: white;
      border: none; border-radius: 6px; font-weight: 700; cursor: pointer; margin-top: 0.5rem;
    }
    .btn-submit:disabled { opacity: 0.5; }
    .login-form__back { display: block; text-align: center; margin-top: 1rem; color: var(--color-text-muted); font-size: 0.85rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  login(): void {
    const e = this.email();
    const p = this.password();
    if (!e || !p) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login(e, p).pipe(
      catchError((err: any) => {
        this.loading.set(false);
        const msg = err.error?.message || err.error?.error || err.statusText || '';
        this.error.set(msg || 'Email o contraseña incorrectos');
        console.error('Login error:', err);
        return of(null);
      }),
    ).subscribe(result => {
      if (result) {
        this.router.navigate(['/admin/dashboard']);
      }
      this.loading.set(false);
    });
  }
}
