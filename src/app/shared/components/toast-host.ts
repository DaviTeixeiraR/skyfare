import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { Icon } from './icon';

/** Lista de avisos no canto da tela. Fica uma única vez, no componente raiz. */
@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'pointer-events-none fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2' },
  template: `
    <div aria-live="polite" class="flex flex-col gap-2">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          role="status"
          class="pointer-events-auto flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-semibold shadow-lg shadow-navy-900/10"
          [class]="toast.kind === 'sucesso' ? 'border-emerald-200 text-emerald-800' : 'border-red-200 text-red-700'"
        >
          <app-icon [name]="toast.kind === 'sucesso' ? 'circle-check' : 'circle-alert'" [size]="18" />
          <span class="flex-1">{{ toast.message }}</span>
          <button type="button" class="text-slate-400 hover:text-slate-600" aria-label="Fechar aviso" (click)="toasts.dismiss(toast.id)">
            <app-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  protected readonly toasts = inject(ToastService);
}
