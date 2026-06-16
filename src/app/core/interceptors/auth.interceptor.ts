import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, retry, switchMap, take, throwError, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';

const REFRESH_COOLDOWN = 30_000;

function createRefreshState() {
  let isRefreshing = false;
  let lastRefreshAttempt = 0;
  const refreshQueue$ = new BehaviorSubject<{ accessToken: string | null } | null>(null);
  return { isRefreshing, lastRefreshAttempt, refreshQueue$ };
}

const refreshState = createRefreshState();

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<any> => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const skipPaths = ['/auth/refresh', '/auth/login'];
  const isAuthRequest = skipPaths.some(p => req.url.endsWith(p));
  if (isAuthRequest) {
    return next(req);
  }

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        const retryable = error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
        if (!retryable) throw error;
        return timer(Math.min(1000 * Math.pow(2, retryCount - 1), 5000));
      },
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        const now = Date.now();
        if (now - refreshState.lastRefreshAttempt < REFRESH_COOLDOWN) {
          return throwError(() => error);
        }
        if (!refreshState.isRefreshing) {
          refreshState.isRefreshing = true;
          refreshState.lastRefreshAttempt = now;
          refreshState.refreshQueue$.next(null);

          return authService.refreshToken().pipe(
            switchMap((res) => {
              refreshState.isRefreshing = false;
              refreshState.refreshQueue$.next({ accessToken: res?.accessToken ?? null });
              if (!res) {
                return throwError(() => error);
              }
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` },
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              refreshState.isRefreshing = false;
              refreshState.refreshQueue$.next({ accessToken: null });
              return throwError(() => refreshError);
            }),
          );
        } else {
          return refreshState.refreshQueue$.pipe(
            filter((data) => data !== null),
            take(1),
            switchMap((data) => {
              if (!data?.accessToken) {
                return throwError(() => error);
              }
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${data.accessToken}` },
              });
              return next(retryReq);
            }),
          );
        }
      }
      return throwError(() => error);
    }),
  );
};
