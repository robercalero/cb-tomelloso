import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  memberType: string;
  memberNumber?: string;
  joinedAt: string;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-members',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div class="page">
      <div class="page__header">
        <h1>Socios</h1>
      </div>

      @if (editingMember(); as m) {
        <div class="modal-overlay" (click)="cancelEdit()"></div>
        <div class="modal">
          <h2>Editar socio #{{ m.memberNumber ?? m.id }}</h2>
          <form (ngSubmit)="saveEdit()" class="edit-form">
            <div class="form-group">
              <label for="edit-name">Nombre</label>
              <input id="edit-name" [(ngModel)]="editForm.name" name="editName" required />
            </div>
            <div class="form-group">
              <label for="edit-email">Email</label>
              <input id="edit-email" type="email" [(ngModel)]="editForm.email" name="editEmail" required />
            </div>
            <div class="form-group">
              <label for="edit-phone">Tel&eacute;fono</label>
              <input id="edit-phone" [(ngModel)]="editForm.phone" name="editPhone" />
            </div>
            <div class="form-group">
              <label for="edit-type">Tipo</label>
              <select id="edit-type" [(ngModel)]="editForm.memberType" name="editType">
                <option value="adulto">Adulto</option>
                <option value="infantil">Infantil</option>
                <option value="familia">Familia</option>
                <option value="protector">Protector</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="editForm.isActive" name="editActive" />
                Activo
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn--save" [disabled]="savingEdit()">
                {{ savingEdit() ? 'Guardando...' : 'Guardar' }}
              </button>
              <button type="button" class="btn btn--cancel" (click)="cancelEdit()">Cancelar</button>
            </div>
          </form>
        </div>
      }

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>N&ordm; Socio</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Fecha alta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (member of members(); track member.id) {
              <tr [class.row--inactive]="!member.isActive">
                <td>{{ member.memberNumber ?? '—' }}</td>
                <td>{{ member.name }}</td>
                <td>{{ member.email }}</td>
                <td>{{ member.memberType }}</td>
                <td>{{ member.joinedAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  @if (member.isActive) {
                    <span class="badge badge--active">Activo</span>
                  } @else {
                    <span class="badge badge--inactive">Inactivo</span>
                  }
                </td>
                <td>
                  <div class="actions">
                    <button class="btn btn--sm btn--edit" (click)="startEdit(member)">Editar</button>
                    @if (member.isActive) {
                      <button class="btn btn--sm btn--delete" (click)="deactivate(member)">Desactivar</button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty">No hay socios registrados</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page__header h1 { font-family: var(--font-heading); font-weight: 800; margin: 0; }
    .table-wrapper { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; border-bottom: 1px solid #eee; }
    .table th { font-weight: 700; color: var(--color-text-muted); background: #fafafa; }
    .table tbody tr:hover { background: #f8f9fa; }
    .row--inactive { opacity: 0.5; }
    .empty { text-align: center; color: var(--color-text-muted); padding: 2rem !important; }
    .actions { display: flex; gap: 0.25rem; }
    .btn { border: none; cursor: pointer; padding: 0.35rem 0.6rem; border-radius: 6px; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; font-weight: 600; }
    .btn--sm { padding: 0.25rem 0.5rem; font-size: 0.85rem; }
    .btn--edit { background: #e8f0fe; color: #1a73e8; }
    .btn--delete { background: #fde8e8; color: #c0392b; }
    .btn--save { background: var(--color-primary); color: white; }
    .btn--cancel { background: #eee; color: var(--color-text); }
    .badge { font-size: 0.75rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 4px; }
    .badge--active { background: #e6f7e6; color: #27ae60; }
    .badge--inactive { background: #fde8e8; color: #c0392b; }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100;
      display: flex; align-items: center; justify-content: center;
    }
    .modal {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: white; padding: 2rem; border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 101;
      width: min(450px, 90vw); max-height: 90vh; overflow-y: auto;
    }
    .modal h2 { font-family: var(--font-heading); font-weight: 800; margin: 0 0 1.5rem; }
    .edit-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-group label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.35rem; }
    .form-group input[type="text"], .form-group input[type="email"], .form-group select {
      width: 100%; padding: 0.6rem 0.75rem;
      border: 1px solid var(--color-border); border-radius: var(--radius-sm);
      font-size: 0.95rem; box-sizing: border-box;
    }
    .form-group input[type="checkbox"] { margin-right: 0.5rem; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
    .form-actions .btn { padding: 0.6rem 1.5rem; font-size: 0.9rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMembersComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  readonly members = signal<Member[]>([]);
  readonly editingMember = signal<Member | null>(null);
  readonly savingEdit = signal(false);

  editForm = { name: '', email: '', phone: '', memberType: 'adulto', isActive: true };

  constructor() {
    this.loadMembers();
  }

  private loadMembers(): void {
    this.api.get<Member[]>('members').pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.members.set(data));
  }

  startEdit(member: Member): void {
    this.editingMember.set(member);
    this.editForm = {
      name: member.name,
      email: member.email,
      phone: member.phone ?? '',
      memberType: member.memberType,
      isActive: member.isActive,
    };
  }

  cancelEdit(): void {
    this.editingMember.set(null);
  }

  saveEdit(): void {
    const member = this.editingMember();
    if (!member) return;
    this.savingEdit.set(true);
    this.api.patch<Member>(`members/${member.id}`, {
      name: this.editForm.name,
      email: this.editForm.email,
      phone: this.editForm.phone || undefined,
      memberType: this.editForm.memberType,
      isActive: this.editForm.isActive,
    }).pipe(
      catchError(() => {
        this.savingEdit.set(false);
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      this.savingEdit.set(false);
      if (result) {
        this.cancelEdit();
        this.loadMembers();
      }
    });
  }

  deactivate(member: Member): void {
    if (!confirm(`Desactivar socio "${member.name}"?`)) return;
    this.api.delete<void>(`members/${member.id}`).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadMembers());
  }
}
