import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type" (click)="toastService.dismiss(toast.id)">
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" (click)="toastService.dismiss(toast.id); $event.stopPropagation()">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px; }
    .toast { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; animation: slideIn 0.3s ease; font-size: 0.9rem; }
    .toast--success { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
    .toast--error { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
    .toast--info { background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8; }
    .toast--warning { background: #fff3cd; color: #856404; border-left: 4px solid #ffc107; }
    .toast__message { flex: 1; }
    .toast__close { background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.7; padding: 0; line-height: 1; }
    .toast__close:hover { opacity: 1; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
