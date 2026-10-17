import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/components/icon';

/** Tela 9: acesso negado (usuário sem permissão para a rota). */
@Component({
  selector: 'app-forbidden',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div class="relative">
        <div class="grid size-28 place-items-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/50">
          <app-icon name="shield-x" [size]="52" [stroke]="1.6" />
        </div>
        <span class="absolute -top-1 -right-3 rounded-full bg-navy-900 px-2.5 py-1 text-xs font-bold text-white">403</span>
      </div>
      <h1 class="mt-8 text-3xl font-extrabold tracking-tight text-navy-900">Acesso negado</h1>
      <p class="mt-3 max-w-md text-slate-500">
        Esta área é restrita a administradores. Se você acha que deveria ter acesso, fale com o responsável pelo sistema.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a routerLink="/" class="btn btn-primary"><app-icon name="house" [size]="17" /> Ir para o início</a>
        <a routerLink="/login" class="btn btn-secondary">Entrar com outra conta</a>
      </div>
    </div>
  `,
})
export class Forbidden {}
