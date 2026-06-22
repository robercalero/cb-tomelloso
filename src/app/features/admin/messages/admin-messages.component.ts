import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ContactMessage } from '../../../models/contact-message.model';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Mensajes</h1>
      </div>

      <div class="messages-layout">
        <div class="messages-list">
          @for (msg of messages(); track msg.id) {
            <div
              class="message-item"
              [class.message-item--unread]="!msg.isRead"
              [class.message-item--selected]="selectedMessage()?.id === msg.id"
              (click)="openMessage(msg)"
            >
              <div class="message-item__header">
                <span class="message-item__name">{{ msg.name }}</span>
                <span class="message-item__date">{{ msg.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="message-item__subject">{{ msg.subject }}</div>
              @if (!msg.isRead) {
                <span class="badge">Nuevo</span>
              }
            </div>
          } @empty {
            <div class="empty">No hay mensajes</div>
          }
        </div>

        @if (selectedMessage(); as msg) {
          <div class="message-detail">
            <div class="message-detail__header">
              <h2>{{ msg.subject }}</h2>
              <div class="message-detail__actions">
                <button class="btn btn--sm btn--danger" (click)="deleteMessage(msg.id)" title="Eliminar mensaje">🗑️</button>
                <button class="btn btn--sm" (click)="closeMessage()">✕</button>
              </div>
            </div>
            <div class="message-detail__meta">
              <span><strong>De:</strong> {{ msg.name }} ({{ msg.email }})</span>
              <span><strong>Fecha:</strong> {{ msg.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="message-detail__body">{{ msg.message }}</div>
          </div>
        } @else {
          <div class="message-detail message-detail--empty">
            <p>Selecciona un mensaje para ver su contenido</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page__header h1 { font-family: var(--font-heading); font-weight: 800; margin: 0; }
    .messages-layout { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; align-items: start; }
    .messages-list { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); max-height: 70vh; overflow-y: auto; }
    .message-item { padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer; transition: 0.15s; position: relative; }
    .message-item:hover { background: #f8f9fa; }
    .message-item--unread { background: #f0f7ff; }
    .message-item--selected { background: #e8f4fd; border-left: 3px solid #2980b9; }
    .message-item__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
    .message-item__name { font-weight: 700; font-size: 0.85rem; }
    .message-item__date { font-size: 0.75rem; color: var(--color-text-muted); }
    .message-item__subject { font-size: 0.8rem; color: var(--color-text-muted); }
    .badge { display: inline-block; background: #e74c3c; color: white; font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 8px; font-weight: 700; margin-top: 0.25rem; }
    .empty { text-align: center; color: var(--color-text-muted); padding: 2rem !important; }
    .message-detail { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); padding: 1.5rem; }
    .message-detail--empty { display: flex; align-items: center; justify-content: center; min-height: 200px; color: var(--color-text-muted); }
    .message-detail__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 1rem; }
    .message-detail__header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .message-detail__actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
    .message-detail__meta { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
    .message-detail__body { white-space: pre-wrap; line-height: 1.6; font-size: 0.9rem; }
    .btn { border: none; cursor: pointer; padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; background: #f0f0f0; }
    .btn--sm { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
    .btn--danger { background: #fce4e4; color: #c0392b; }
    .btn--danger:hover { background: #f5c6c6; }
    @media (max-width: 768px) { .messages-layout { grid-template-columns: 1fr; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMessagesComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  readonly messages = signal<ContactMessage[]>([]);
  readonly selectedMessage = signal<ContactMessage | null>(null);

  constructor() {
    this.loadMessages();
  }

  private loadMessages(): void {
    this.api.get<ContactMessage[]>('contact').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.messages.set(data));
  }

  openMessage(msg: ContactMessage): void {
    if (!msg.isRead) {
      this.api.get<ContactMessage>(`contact/${msg.id}`).pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(full => {
        if (full) {
          this.selectedMessage.set(full);
          this.messages.set(this.messages().map(m => m.id === msg.id ? { ...m, isRead: true } : m));
        }
      });
    } else {
      this.selectedMessage.set(msg);
    }
  }

  closeMessage(): void {
    this.selectedMessage.set(null);
  }

  deleteMessage(id: number): void {
    if (!confirm('¿Eliminar este mensaje?')) return;
    this.api.delete(`contact/${id}`).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.messages.set(this.messages().filter(m => m.id !== id));
        if (this.selectedMessage()?.id === id) {
          this.selectedMessage.set(null);
        }
      },
    });
  }
}
