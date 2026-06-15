import { Injectable, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Sponsor } from '../../models/sponsor.model';

@Injectable({ providedIn: 'root' })
export class SponsorsService {
  private api = inject(ApiService);

  private _sponsors = signal<Sponsor[]>([]);

  readonly sponsors = this._sponsors.asReadonly();

  loadSponsors(): void {
    this.api.get<Sponsor[]>('sponsors').pipe(
      catchError(() => of(this._sponsors()))
    ).subscribe(s => this._sponsors.set(s));
  }
}
