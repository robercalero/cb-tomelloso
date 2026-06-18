import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface AdminStats {
  pendingOrders: number;
  unreadMessages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  readonly stats = signal<AdminStats>({ pendingOrders: 0, unreadMessages: 0 });

  load(): void {
    this.api.get<AdminStats>('admin/stats').pipe(
      catchError(() => of({ pendingOrders: 0, unreadMessages: 0 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(s => this.stats.set(s));
  }
}
