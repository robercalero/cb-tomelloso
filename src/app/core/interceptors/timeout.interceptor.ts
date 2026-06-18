import { HttpInterceptorFn } from '@angular/common/http';
import { timeout, catchError, throwError } from 'rxjs';

const REQUEST_TIMEOUT = 15_000;

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    timeout(REQUEST_TIMEOUT),
    catchError((err) => {
      if (err.name === 'TimeoutError') {
        console.error(`[Timeout] ${req.method} ${req.url} — no respondió en ${REQUEST_TIMEOUT / 1000}s`);
      }
      return throwError(() => err);
    }),
  );
};
