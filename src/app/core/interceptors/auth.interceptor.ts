import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<any> => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const isAuthRequest = req.url.includes('/auth/refresh') || req.url.includes('/auth/login');

  if (isAuthRequest) {
    return next(req);
  }

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !isRefreshing) {
        isRefreshing = true;
        return authService.refreshToken().pipe(
          switchMap((res: { accessToken: string } | null) => {
            isRefreshing = false;
            if (!res) {
              authService.logout().subscribe();
              return throwError(() => error);
            }
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            });
            return next(retryReq);
          }),
          catchError(() => {
            isRefreshing = false;
            authService.logout().subscribe();
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
