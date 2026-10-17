import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { USUARIO_LOGADO } from '../core/mock/mock-data';
import { Icon, IconName } from '../shared/components/icon';
import { Logo } from '../shared/components/logo';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  exact?: boolean;
  admin?: boolean;
}

/** Layout das telas internas: barra de navegação, conteúdo e rodapé. */
@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, Icon],
  host: { class: 'flex min-h-screen flex-col' },
  template: `
    <header class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a routerLink="/" aria-label="Skyfare, página inicial"><app-logo [size]="34" /></a>

        <nav class="hidden items-center gap-1 md:flex" aria-label="Principal">
          @for (item of nav; track item.path) {
            @if (!item.admin || user.perfil === 'admin') {
              <a
                [routerLink]="item.path"
                routerLinkActive="!bg-brand-50 !text-brand-700"
                [routerLinkActiveOptions]="{ exact: !!item.exact }"
                class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy-900"
              >
                <app-icon [name]="item.icon" [size]="17" /> {{ item.label }}
              </a>
            }
          }
        </nav>

        <div class="ml-auto flex items-center gap-3">
          <a routerLink="/viagens/nova" class="btn btn-primary hidden sm:inline-flex">
            <app-icon name="plus" [size]="17" /> Nova viagem
          </a>
          <div class="hidden items-center gap-2.5 border-l border-slate-200 pl-3 lg:flex">
            <span class="grid size-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">DT</span>
            <span class="leading-tight">
              <span class="block text-sm font-semibold text-navy-900">{{ user.nome }}</span>
              <span class="block text-xs text-slate-500">Administrador</span>
            </span>
            <a routerLink="/login" class="btn btn-ghost !p-2" aria-label="Sair" title="Sair">
              <app-icon name="logout" [size]="18" />
            </a>
          </div>
          <button
            type="button"
            class="btn btn-ghost !p-2 md:hidden"
            [attr.aria-expanded]="menuOpen()"
            aria-label="Abrir menu"
            (click)="menuOpen.set(!menuOpen())"
          >
            <app-icon [name]="menuOpen() ? 'x' : 'menu'" />
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <nav class="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Menu móvel">
          @for (item of nav; track item.path) {
            @if (!item.admin || user.perfil === 'admin') {
              <a
                [routerLink]="item.path"
                (click)="menuOpen.set(false)"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <app-icon [name]="item.icon" [size]="18" /> {{ item.label }}
              </a>
            }
          }
          <a routerLink="/login" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            <app-icon name="logout" [size]="18" /> Sair
          </a>
        </nav>
      }
    </header>

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <router-outlet />
    </main>

    <footer class="border-t border-slate-200/70 bg-white">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <app-logo [size]="22" />
        <p>Dados de clima: Open-Meteo · Países: REST Countries · Câmbio: AwesomeAPI</p>
        <p>© 2026 Davi Teixeira</p>
      </div>
    </footer>
  `,
})
export class MainLayout {
  protected readonly user = USUARIO_LOGADO;
  protected readonly menuOpen = signal(false);

  protected readonly nav: NavItem[] = [
    { label: 'Início', path: '/', icon: 'house', exact: true },
    { label: 'Minhas viagens', path: '/viagens', icon: 'luggage' },
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Usuários', path: '/admin/usuarios', icon: 'users', admin: true },
  ];
}
