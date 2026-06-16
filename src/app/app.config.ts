import { ApplicationConfig, provideZonelessChangeDetection, APP_INITIALIZER, LOCALE_ID, ErrorHandler, isDevMode, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError, of, timeout } from 'rxjs';
import { AuthService, AuthUser } from './core/services/auth.service';
import { getApiBaseUrl } from './core/utils/api-url.utils';

registerLocaleData(localeEs);

function initAuth(authService: AuthService, http: HttpClient, platformId: Object) {
  return async () => {
    if (isPlatformServer(platformId)) return;
    const token = authService.getAccessToken();
    if (!token) return;
    if (authService.isTokenExpired()) {
      const refreshed = await firstValueFrom(authService.refreshToken().pipe(catchError(() => of(null))));
      if (!refreshed) return;
    }
    const user = await firstValueFrom(
      http.get<AuthUser>(`${getApiBaseUrl()}/auth/me`).pipe(
        timeout(5_000),
        catchError(() => of(null))
      )
    );
    if (user) authService.setCurrentUser(user);
  };
}

class ViewTransitionErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (error instanceof DOMException && error.name === 'InvalidStateError') {
      return;
    }
    console.error(error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000',
    }),
    { provide: LOCALE_ID, useValue: 'es' },
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: AuthService, http: HttpClient, platformId: Object) =>
        initAuth(authService, http, platformId),
      deps: [AuthService, HttpClient, PLATFORM_ID],
      multi: true,
    },
    { provide: ErrorHandler, useClass: ViewTransitionErrorHandler }
  ]
};
