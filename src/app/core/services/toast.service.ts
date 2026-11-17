import { Injectable, signal } from '@angular/core';

export type ToastKind = 'sucesso' | 'erro';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const DURATION_MS = 3500;

/** Avisos curtos ("Viagem salva") exibidos pelo componente ToastHost. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly state = signal<Toast[]>([]);

  readonly toasts = this.state.asReadonly();

  success(message: string): void {
    this.show('sucesso', message);
  }

  error(message: string): void {
    this.show('erro', message);
  }

  dismiss(id: number): void {
    this.state.update((list) => list.filter((t) => t.id !== id));
  }

  private show(kind: ToastKind, message: string) {
    const toast: Toast = { id: this.nextId++, kind, message };
    this.state.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), DURATION_MS);
  }
}
