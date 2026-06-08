import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Activity {
  id: number;
  title: string;
  description?: string;
  activityType: 'torneo' | 'escuela' | 'evento' | 'copa' | 'amistoso' | 'otro';
  startDate: string;
  endDate?: string;
  venue?: string;
  imageUrl?: string;
  isPublished: boolean;
}

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private api = inject(ApiService);

  readonly activities = toSignal(
    this.api.get<Activity[]>('activities').pipe(catchError(() => of([] as Activity[]))),
    { initialValue: [] as Activity[] }
  );
}
