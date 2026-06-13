import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ContactMessage } from '../../models/contact-message.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private api = inject(ApiService);

  sendMessage(data: { name: string; email: string; subject?: string; message: string }): Observable<ContactMessage | null> {
    return this.api.post<ContactMessage>('contact', data).pipe(
      catchError(() => of(null))
    );
  }
}
