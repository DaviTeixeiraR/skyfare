import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { USUARIOS } from '../../core/mock/mock-data';
import { Perfil, User } from '../../core/models';
import { Icon } from '../../shared/components/icon';
import { StatCard } from '../../shared/components/stat-card';

/** Tela 8: gerenciamento de usuários (somente administrador). */
@Component({
  selector: 'app-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, StatCard, DatePipe],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="badge mb-2 bg-navy-900 text-white"><app-icon name="shield" [size]="13" /> Área do administrador</p>
        <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">Gerenciamento de usuários</h1>
        <p class="mt-1 text-slate-500">Altere o perfil de acesso e ative ou desative contas.</p>
      </div>
    </div>

    <div class="mt-6 grid gap-5 sm:grid-cols-3">
      <app-stat-card icon="users" label="Usuários cadastrados" [value]="users().length + ''" />
      <app-stat-card icon="circle-check" label="Contas ativas" [value]="activeCount() + ''" tone="bg-emerald-50 text-emerald-600" />
      <app-stat-card icon="shield" label="Administradores" [value]="adminCount() + ''" tone="bg-indigo-50 text-indigo-600" />
    </div>

    <section class="card mt-5 overflow-hidden">
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <label class="relative min-w-60 flex-1">
          <app-icon name="search" [size]="18" class="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input class="input !border-transparent !bg-slate-50 !pl-10" placeholder="Buscar por nome ou e-mail"
                 [value]="search()" (input)="search.set($any($event.target).value)" />
        </label>
        <label class="flex items-center gap-2 text-sm font-medium text-slate-500">
          <app-icon name="funnel" [size]="16" />
          <select class="input !w-auto !py-2" [value]="profile()" (change)="profile.set($any($event.target).value)">
            <option value="todos">Todos os perfis</option>
            <option value="usuario">Usuários</option>
            <option value="admin">Administradores</option>
          </select>
        </label>
      </div>

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
                      <p class="truncate font-semibold text-navy-900">{{ u.nome }}</p>
                      <p class="truncate text-xs text-slate-500">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5">
                  <select class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium focus:border-brand-500 focus:outline-none"
                          [value]="u.perfil" (change)="setProfile(u, $any($event.target).value)">
                    <option value="usuario">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td class="px-5 py-3.5 text-center font-semibold text-navy-900">{{ u.viagens }}</td>
                <td class="px-5 py-3.5 text-slate-500">{{ u.criadoEm + 'T12:00:00' | date: 'dd/MM/yyyy' }}</td>
                <td class="px-5 py-3.5">
                  <button type="button" role="switch" [attr.aria-checked]="u.ativo" (click)="toggle(u)"
                          class="inline-flex items-center gap-2 text-sm font-medium" [class]="u.ativo ? 'text-emerald-700' : 'text-slate-500'">
                    <span class="relative h-5 w-9 rounded-full transition-colors" [class]="u.ativo ? 'bg-emerald-500' : 'bg-slate-300'">
                      <span class="absolute top-0.5 size-4 rounded-full bg-white shadow transition-all" [class]="u.ativo ? 'left-[18px]' : 'left-0.5'"></span>
                    </span>
                    {{ u.ativo ? 'Ativo' : 'Inativo' }}
                  </button>
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button type="button" class="btn btn-ghost !p-2" aria-label="Mais ações"><app-icon name="ellipsis" [size]="16" /></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p class="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Mostrando {{ visible().length }} de {{ users().length }} usuários</p>
    </section>
  `,
})
export class Users {
  protected readonly users = signal<User[]>(USUARIOS.map((u) => ({ ...u })));
  protected readonly search = signal('');
  protected readonly profile = signal<'todos' | Perfil>('todos');

  protected readonly activeCount = computed(() => this.users().filter((u) => u.ativo).length);
  protected readonly adminCount = computed(() => this.users().filter((u) => u.perfil === 'admin').length);
  protected readonly visible = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.users()
      .filter((u) => this.profile() === 'todos' || u.perfil === this.profile())
      .filter((u) => !q || `${u.nome} ${u.email}`.toLowerCase().includes(q));
  });

  protected initials(u: User) {
    const parts = u.nome.split(' ');
    return (parts[0][0] + (parts.at(-1)?.[0] ?? '')).toUpperCase();
  }

  protected avatarColor(u: User) {
    const colors = ['bg-brand-100 text-brand-700', 'bg-sun-100 text-sun-700', 'bg-emerald-100 text-emerald-700', 'bg-indigo-100 text-indigo-700'];
    return colors[u.id % colors.length];
  }

  protected toggle(user: User) {
    this.users.update((list) => list.map((u) => (u.id === user.id ? { ...u, ativo: !u.ativo } : u)));
  }

  protected setProfile(user: User, perfil: Perfil) {
    this.users.update((list) => list.map((u) => (u.id === user.id ? { ...u, perfil } : u)));
  }
}
