import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Sponsor } from '../../models/sponsor.model';

@Injectable({ providedIn: 'root' })
export class SponsorsService {
  private api = inject(ApiService);

  readonly sponsors = toSignal(
    this.api.get<Sponsor[]>('sponsors').pipe(catchError(() => of([] as Sponsor[]))),
    { initialValue: [] as Sponsor[] }
  );
}
