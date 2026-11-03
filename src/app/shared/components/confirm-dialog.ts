import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from './icon';

/** Janela de confirmação para ações sem volta, como excluir uma viagem. */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { '(document:keydown.escape)': 'open() && cancelled.emit()' },
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 grid place-items-center bg-navy-900/50 p-4 backdrop-blur-[2px]" (click)="cancelled.emit()">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
          class="card w-full max-w-md p-6"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start gap-4">
            <span class="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
              <app-icon name="alert" [size]="22" />
            </span>
            <div>
              <h2 id="confirm-title" class="text-lg font-bold text-navy-900">{{ heading() }}</h2>
              <p id="confirm-message" class="mt-1 text-sm text-slate-600">{{ message() }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn btn-secondary" (click)="cancelled.emit()">Cancelar</button>
            <button type="button" class="btn !bg-red-600 !text-white hover:!bg-red-700" (click)="confirmed.emit()">
              <app-icon name="trash" [size]="16" /> {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly heading = input('Confirmar exclusão');
  readonly message = input('Esta ação não pode ser desfeita.');
  readonly confirmLabel = input('Excluir');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
