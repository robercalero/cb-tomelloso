import { ApplicationConfig, provideZonelessChangeDetection, APP_INITIALIZER, LOCALE_ID, ErrorHandler, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, withViewTransitions, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError, of } from 'rxjs';
import { AuthService, AuthUser } from './core/services/auth.service';
import { getApiBaseUrl } from './core/utils/api-url.utils';

registerLocaleData(localeEs);

function initAuth(authService: AuthService, http: HttpClient) {
  return async () => {
    const token = authService.getAccessToken();
    if (!token) return;
    try {
      const user = await firstValueFrom(
        http.get<AuthUser>(`${getApiBaseUrl()}/auth/me`).pipe(
          catchError(() => of(null))
        )
      );
      if (user) authService.setCurrentUser(user);
    } catch {
      // Token inválido o expirado — el interceptor manejará el refresh
    }
  };
}

class ViewTransitionErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (error instanceof DOMException && error.name === 'InvalidStateError') {
      return;
    }
    void error;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000',
    }),
    { provide: LOCALE_ID, useValue: 'es' },
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService, http: HttpClient) =>
        initAuth(authService, http),
      deps: [AuthService, HttpClient],
      multi: true,
    },
    { provide: ErrorHandler, useClass: ViewTransitionErrorHandler }
  ]
};
