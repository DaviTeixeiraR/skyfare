import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/components/icon';

/** Tela 10: página não encontrada (404). */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div class="relative flex items-center gap-3 text-[7rem] leading-none font-extrabold tracking-tighter text-brand-600 sm:text-[9rem]">
        <span>4</span>
        <span class="grid size-24 place-items-center rounded-full bg-sun-400 text-white shadow-lg shadow-sun-500/30 sm:size-32">
          <app-icon name="compass" [size]="64" [stroke]="1.6" />
        </span>
        <span>4</span>
      </div>
      <h1 class="mt-6 text-3xl font-extrabold tracking-tight text-navy-900">Parece que você se perdeu</h1>
      <p class="mt-3 max-w-md text-slate-500">
        A página que você procura não existe ou mudou de endereço. Que tal voltar e escolher um novo destino?
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a routerLink="/" class="btn btn-primary"><app-icon name="search" [size]="17" /> Buscar uma cidade</a>
        <a routerLink="/viagens" class="btn btn-secondary">Minhas viagens</a>
      </div>
    </div>
  `,
})
export class NotFound {}
