import { ApplicationConfig, provideZonelessChangeDetection, LOCALE_ID, ErrorHandler } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, withViewTransitions, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

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
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: ErrorHandler, useClass: ViewTransitionErrorHandler }
  ]
};
