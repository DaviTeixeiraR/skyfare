import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, IconName } from '../../shared/components/icon';

interface ProfileAccess {
  perfil: string;
  descricao: string;
  icon: IconName;
  telas: { nome: string; liberada: boolean }[];
}

/** Tela 9: acesso negado (usuário sem permissão para a rota). */
@Component({
  selector: 'app-forbidden',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="grid items-center gap-10 py-6 lg:grid-cols-[1fr_1.1fr] lg:py-10">
      <section class="text-center lg:text-left">
        <div class="relative mx-auto inline-block lg:mx-0">
          <div class="grid size-28 place-items-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/50">
            <app-icon name="shield-x" [size]="52" [stroke]="1.6" />
          </div>
          <span class="absolute -top-1 -right-3 rounded-full bg-navy-900 px-2.5 py-1 text-xs font-bold text-white">403</span>
        </div>
        <h1 class="mt-8 text-4xl font-extrabold tracking-tight text-navy-900">Acesso negado</h1>
        <p class="mt-3 max-w-md text-lg text-slate-500 lg:max-w-lg">
          Você tentou abrir a área de <strong class="font-semibold text-navy-900">Gerenciamento de usuários</strong>,
          que é exclusiva para administradores.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
          <a routerLink="/" class="btn btn-primary"><app-icon name="house" [size]="17" /> Ir para o início</a>
          <a routerLink="/viagens" class="btn btn-secondary"><app-icon name="luggage" [size]="17" /> Minhas viagens</a>
          <a routerLink="/login" class="btn btn-ghost">Entrar com outra conta</a>
        </div>

        <div class="mt-10 flex max-w-lg items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 text-left text-sm text-slate-600">
          <app-icon name="info" [size]="18" class="mt-0.5 text-brand-600" />
          <p>
            <strong class="font-semibold text-navy-900">Precisa de acesso?</strong>
            Peça a um administrador para alterar o seu perfil na tela de gerenciamento de usuários.
          </p>
        </div>
      </section>

      <section class="card p-6 sm:p-8">
        <h2 class="flex items-center gap-2 font-bold text-navy-900">
          <app-icon name="shield" [size]="18" class="text-brand-600" /> Perfis de acesso do Skyfare
        </h2>
        <p class="mt-1 text-sm text-slate-500">O que cada perfil pode abrir no sistema.</p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          @for (p of profiles; track p.perfil) {
            <div class="rounded-2xl border border-slate-200 p-5"
                 [class]="p.perfil === 'Administrador' ? '!border-brand-200 bg-brand-50/40' : ''">
              <div class="flex items-center gap-3">
                <span class="grid size-10 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-slate-200">
                  <app-icon [name]="p.icon" [size]="20" />
                </span>
                <div>
                  <p class="font-bold text-navy-900">{{ p.perfil }}</p>
                  <p class="text-xs text-slate-500">{{ p.descricao }}</p>
                </div>
              </div>
              <ul class="mt-4 space-y-2.5 text-sm">
                @for (t of p.telas; track t.nome) {
                  <li class="flex items-center gap-2" [class]="t.liberada ? 'text-slate-700' : 'text-slate-400'">
                    <span class="grid size-5 place-items-center rounded-full"
                          [class]="t.liberada ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'">
                      <app-icon [name]="t.liberada ? 'check' : 'lock'" [size]="12" [stroke]="2.5" />
                    </span>
                    {{ t.nome }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class Forbidden {
  private static telas(admin: boolean) {
    return [
      { nome: 'Busca rápida', liberada: true },
      { nome: 'Minhas viagens', liberada: true },
      { nome: 'Cadastro e edição de viagens', liberada: true },
      { nome: 'Dashboard', liberada: true },
      { nome: 'Indicadores do administrador', liberada: admin },
      { nome: 'Gerenciamento de usuários', liberada: admin },
    ];
  }

  protected readonly profiles: ProfileAccess[] = [
    { perfil: 'Usuário', descricao: 'Perfil padrão das contas', icon: 'user', telas: Forbidden.telas(false) },
    { perfil: 'Administrador', descricao: 'Gerencia contas e perfis', icon: 'shield', telas: Forbidden.telas(true) },
  ];
}
