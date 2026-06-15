import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, retry, switchMap, take, throwError, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshQueue$ = new BehaviorSubject<{ accessToken: string | null } | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<any> => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const protectedPaths = ['/admin', '/auth/me', '/auth/logout'];
  const needsAuth = protectedPaths.some(p => req.url.includes(p));
  if (!needsAuth) {
    return next(req);
  }

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
        if (!isRefreshing) {
          isRefreshing = true;
          refreshQueue$.next(null);

          return authService.refreshToken().pipe(
            switchMap((res) => {
              isRefreshing = false;
              refreshQueue$.next({ accessToken: res?.accessToken ?? null });
              if (!res) {
                authService.logout().subscribe();
                return throwError(() => error);
              }
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` },
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshQueue$.next({ accessToken: null });
              authService.logout().subscribe();
              return throwError(() => refreshError);
            }),
          );
        } else {
          return refreshQueue$.pipe(
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
