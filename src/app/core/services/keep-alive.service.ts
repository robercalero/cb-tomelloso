import { Injectable, inject, DestroyRef } from '@angular/core';
import { interval, timer, of } from 'rxjs';
import { switchMap, catchError, retryWhen, delayWhen } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KeepAliveService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  start() {
    interval(300_000).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(() =>
        this.http.get(`${environment.apiUrl}/health`, { responseType: 'text' }).pipe(
          retryWhen(errors =>
            errors.pipe(
              delayWhen(() => timer(30_000)),
            ),
          ),
          catchError(() => of(null)),
        ),
      ),
    ).subscribe();
  }
}
