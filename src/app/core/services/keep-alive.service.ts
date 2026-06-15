import { Injectable, inject, DestroyRef } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KeepAliveService {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  start() {
    interval(300_000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.http.get(`${environment.apiUrl}/health`, { responseType: 'text' }).subscribe();
    });
  }
}
