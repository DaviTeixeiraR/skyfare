import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Icon } from '../shared/components/icon';
import { Logo } from '../shared/components/logo';

/** Layout das telas de login e cadastro: painel da marca + formulário. */
@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, Logo, Icon],
  host: { class: 'grid min-h-screen lg:grid-cols-[1.05fr_1fr]' },
  template: `
    <aside class="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-navy-900 p-12 text-white lg:flex lg:flex-col">
      <div class="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-sun-400/90 blur-[2px]"></div>
      <svg class="pointer-events-none absolute bottom-0 left-0 w-full text-white/10" viewBox="0 0 600 220" fill="currentColor" aria-hidden="true">
        <path d="M0 160c60-40 120-40 180 0s120 40 180 0 120-40 180 0 60 20 60 20v80H0Z" />
        <path d="M0 190c70-30 140-30 210 0s140 30 210 0 120-25 180 0v30H0Z" opacity=".6" />
      </svg>

      <a routerLink="/" class="relative"><app-logo [size]="42" [light]="true" /></a>

      <div class="relative mt-auto mb-auto max-w-md">
        <p class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
          <app-icon name="plane-takeoff" [size]="16" /> Planejador de viagens
        </p>
        <h1 class="text-4xl leading-tight font-extrabold tracking-tight">
          O tempo e o câmbio do seu destino, na mesma tela.
        </h1>
        <p class="mt-4 text-lg text-brand-100">
          Pesquise uma cidade, veja a previsão do tempo e quanto vale a moeda local em reais. Depois é só salvar a viagem e acompanhar o orçamento.
        </p>

        <div class="mt-10 grid max-w-sm grid-cols-2 gap-3">
          <div class="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur-sm">
            <p class="flex items-center gap-1.5 text-xs text-brand-100"><app-icon name="cloud" [size]="14" /> Edimburgo</p>
            <p class="mt-1 text-3xl font-extrabold">11°</p>
            <p class="text-xs text-brand-100">Nublado</p>
          </div>
          <div class="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15 backdrop-blur-sm">
            <p class="flex items-center gap-1.5 text-xs text-brand-100"><app-icon name="coins" [size]="14" /> 1 GBP</p>
            <p class="mt-1 text-3xl font-extrabold text-sun-400">R$ 7,32</p>
            <p class="text-xs text-brand-100">+0,42% hoje</p>
          </div>
        </div>
      </div>

      <p class="relative text-sm text-brand-100">© 2026 Skyfare · Universidade FUMEC</p>
    </aside>

    <section class="flex items-center justify-center bg-white px-6 py-12 sm:px-12">
      <div class="w-full max-w-md">
        <a routerLink="/" class="mb-10 inline-flex lg:hidden"><app-logo [size]="38" /></a>
        <router-outlet />
      </div>
    </section>
  `,
})
export class AuthLayout {}
