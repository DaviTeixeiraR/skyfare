import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { errorMessage } from '../../core/errors';
import { Perfil, User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TripService } from '../../core/services/trip.service';
import { UserProfileFilter, UserService } from '../../core/services/user.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';
import { Icon } from '../../shared/components/icon';
import { StatCard } from '../../shared/components/stat-card';

/** Tela 8: gerenciamento de usuários (somente administrador). */
@Component({
  selector: 'app-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, StatCard, ConfirmDialog, DatePipe],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="badge mb-2 bg-navy-900 text-white"><app-icon name="shield" [size]="13" /> Área do administrador</p>
        <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">Gerenciamento de usuários</h1>
        <p class="mt-1 text-slate-500">Altere o perfil de acesso e ative ou desative contas.</p>
      </div>
    </div>

    <div class="mt-6 grid gap-5 sm:grid-cols-3">
      <app-stat-card icon="users" label="Usuários cadastrados" [value]="userService.total() + ''" />
      <app-stat-card icon="circle-check" label="Contas ativas" [value]="userService.activeCount() + ''" tone="bg-emerald-50 text-emerald-600" />
      <app-stat-card icon="shield" label="Administradores" [value]="userService.adminCount() + ''" tone="bg-indigo-50 text-indigo-600" />
    </div>

    <section class="card mt-5 overflow-hidden">
      <form class="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4" [formGroup]="filters">
        <label class="relative min-w-60 flex-1">
          <app-icon name="search" [size]="18" class="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input class="input !border-transparent !bg-slate-50 !pl-10" placeholder="Buscar por nome ou e-mail"
                 formControlName="texto" maxlength="60" />
        </label>
        <label class="flex items-center gap-2 text-sm font-medium text-slate-500">
          <app-icon name="funnel" [size]="16" />
          <select class="input !w-auto !py-2" formControlName="perfil">
            <option value="todos">Todos os perfis</option>
            <option value="usuario">Usuários</option>
            <option value="admin">Administradores</option>
          </select>
        </label>
      </form>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th class="px-5 py-3">Usuário</th>
              <th class="px-5 py-3">Perfil</th>
              <th class="px-5 py-3 text-center">Viagens</th>
              <th class="px-5 py-3">Cadastro</th>
              <th class="px-5 py-3">Situação</th>
              <th class="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (u of visible(); track u.id) {
              <tr class="hover:bg-slate-50/60" [class.opacity-60]="!u.ativo">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <span class="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold" [class]="avatarColor(u)">{{ initials(u) }}</span>
                    <div class="min-w-0">
                      <p class="truncate font-semibold text-navy-900">
                        {{ u.nome }}
                        @if (isSelf(u)) { <span class="badge ml-1 bg-brand-50 text-brand-700">você</span> }
                      </p>
                      <p class="truncate text-xs text-slate-500">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5">
                  <select class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                          [value]="u.perfil" [disabled]="isSelf(u)" [title]="isSelf(u) ? 'Você não pode alterar o próprio perfil' : ''"
                          (change)="setProfile(u, $any($event.target).value)">
                    <option value="usuario">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td class="px-5 py-3.5 text-center font-semibold text-navy-900">{{ tripCount(u) }}</td>
                <td class="px-5 py-3.5 text-slate-500">{{ u.criadoEm + 'T12:00:00' | date: 'dd/MM/yyyy' }}</td>
                <td class="px-5 py-3.5">
                  <button type="button" role="switch" [attr.aria-checked]="u.ativo" (click)="toggle(u)" [disabled]="isSelf(u)"
                          [title]="isSelf(u) ? 'Você não pode desativar a própria conta' : ''"
                          class="inline-flex items-center gap-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60" [class]="u.ativo ? 'text-emerald-700' : 'text-slate-500'">
                    <span class="relative h-5 w-9 rounded-full transition-colors" [class]="u.ativo ? 'bg-emerald-500' : 'bg-slate-300'">
                      <span class="absolute top-0.5 size-4 rounded-full bg-white shadow transition-all" [class]="u.ativo ? 'left-[18px]' : 'left-0.5'"></span>
                    </span>
                    {{ u.ativo ? 'Ativo' : 'Inativo' }}
                  </button>
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button type="button" class="btn btn-ghost !p-2 hover:!bg-red-50 hover:!text-red-600" [disabled]="isSelf(u)"
                          [attr.aria-label]="'Excluir ' + u.nome" [title]="isSelf(u) ? 'Você não pode excluir a própria conta' : 'Excluir usuário'"
                          (click)="toDelete.set(u)">
                    <app-icon name="trash" [size]="16" />
                  </button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="px-5 py-10 text-center text-slate-500">Nenhum usuário encontrado para esta busca.</td></tr>
            }
          </tbody>
        </table>
      </div>
      <p class="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Mostrando {{ visible().length }} de {{ userService.total() }} usuários</p>
    </section>

    <app-confirm-dialog
      [open]="!!toDelete()"
      heading="Excluir usuário?"
      [message]="'A conta de ' + (toDelete()?.nome ?? '') + ' será removida. Esta ação não pode ser desfeita.'"
      (confirmed)="confirmDelete()"
      (cancelled)="toDelete.set(null)"
    />
  `,
})
export class Users {
  protected readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly trips = inject(TripService);
  private readonly toast = inject(ToastService);

  /** Filtros da tabela (formulário reativo). */
  protected readonly filters = inject(NonNullableFormBuilder).group({
    texto: ['', Validators.maxLength(60)],
    perfil: ['todos' as UserProfileFilter],
  });
  private readonly filterValue = toSignal(this.filters.valueChanges, { initialValue: this.filters.getRawValue() });
  /** Usuário aguardando confirmação de exclusão. */
  protected readonly toDelete = signal<User | null>(null);

  protected readonly visible = computed(() => this.userService.search(this.filterValue().texto ?? '', this.filterValue().perfil ?? 'todos'));

  protected readonly tripCount = (u: User) => this.trips.countByUser(u.id);
  /** O administrador não mexe na própria conta, para não se bloquear sem querer. */
  protected readonly isSelf = (u: User) => u.id === this.auth.user()?.id;

  protected initials(u: User) {
    const parts = u.nome.split(' ');
    return (parts[0][0] + (parts.at(-1)?.[0] ?? '')).toUpperCase();
  }

  protected avatarColor(u: User) {
    const colors = ['bg-brand-100 text-brand-700', 'bg-sun-100 text-sun-700', 'bg-emerald-100 text-emerald-700', 'bg-indigo-100 text-indigo-700'];
    return colors[u.id % colors.length];
  }

  protected toggle(user: User) {
    this.run(this.userService.toggleActive(user.id), (u) => `Conta de ${u.nome} ${u.ativo ? 'ativada' : 'desativada'}.`);
  }

  protected setProfile(user: User, perfil: Perfil) {
    this.run(
      this.userService.setProfile(user.id, perfil),
      () => `${user.nome} agora é ${perfil === 'admin' ? 'administrador' : 'usuário'}.`,
    );
  }

  protected confirmDelete() {
    const user = this.toDelete();
    this.toDelete.set(null);
    if (!user) return;
    this.run(this.userService.remove(user.id), () => {
      this.trips.forgetUser(user.id);
      return `Conta de ${user.nome} excluída.`;
    });
  }

  /** Envia a requisição e mostra o aviso de sucesso ou de erro. */
  private run<T>(request: Observable<T>, success: (result: T) => string) {
    request.subscribe({
      next: (result) => this.toast.success(success(result)),
      error: (e) => this.toast.error(errorMessage(e)),
    });
  }
}
