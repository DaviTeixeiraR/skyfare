import { ChangeDetectionStrategy, Component } from '@angular/core';
import { COTACOES } from '../../core/mock/mock-data';
import { ExchangeCard } from '../../shared/components/exchange-card';
import { Icon, IconName } from '../../shared/components/icon';
import { Logo } from '../../shared/components/logo';
import { WeatherCard } from '../../shared/components/weather-card';

interface Swatch {
  name: string;
  hex: string;
  use: string;
  dark?: boolean;
}

/** Guia de estilo do protótipo: cores, tipografia, logotipo e componentes. */
@Component({
  selector: 'app-style-guide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo, Icon, WeatherCard, ExchangeCard],
  template: `
    <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">Guia de estilo</h1>
    <p class="mt-1 text-slate-500">Identidade visual e componentes usados em todas as telas do Skyfare.</p>

    <section class="mt-8 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <div class="card p-6">
        <h2 class="mb-1 font-bold text-navy-900">Logotipo</h2>
        <p class="mb-5 text-sm text-slate-500">Sol + avião de papel. "Sky" (céu) em azul-noite e "fare" (tarifa) em âmbar.</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid h-32 place-items-center rounded-xl bg-slate-50"><app-logo [size]="44" /></div>
          <div class="grid h-32 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-navy-900"><app-logo [size]="44" [light]="true" /></div>
          <div class="grid h-24 place-items-center rounded-xl bg-slate-50"><app-logo [size]="56" [showText]="false" /></div>
          <div class="grid h-24 place-items-center rounded-xl bg-slate-50"><app-logo [size]="30" [showText]="false" /></div>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="mb-1 font-bold text-navy-900">Cores</h2>
        <p class="mb-5 text-sm text-slate-500">Azul para ações e clima, âmbar para dinheiro e câmbio, azul-noite para textos.</p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          @for (s of swatches; track s.hex) {
            <div class="overflow-hidden rounded-xl ring-1 ring-slate-200">
              <div class="flex h-16 items-end p-2 text-xs font-bold" [style.background]="s.hex" [class]="s.dark ? 'text-white' : 'text-navy-900'">{{ s.hex }}</div>
              <div class="p-2">
                <p class="text-sm font-semibold text-navy-900">{{ s.name }}</p>
                <p class="text-xs text-slate-500">{{ s.use }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="mt-5 grid gap-5 lg:grid-cols-2">
      <div class="card p-6">
        <h2 class="mb-1 font-bold text-navy-900">Tipografia</h2>
        <p class="mb-5 text-sm text-slate-500">Plus Jakarta Sans (Google Fonts), pesos 400 a 800.</p>
        <p class="text-4xl font-extrabold tracking-tight">Título 1 · 36px</p>
        <p class="mt-2 text-2xl font-extrabold tracking-tight">Título 2 · 24px</p>
        <p class="mt-2 text-lg font-bold">Título de cartão · 18px</p>
        <p class="mt-2 text-base">Texto do corpo · 16px. O tempo e o câmbio do seu destino, na mesma tela.</p>
        <p class="mt-2 text-sm text-slate-500">Texto de apoio · 14px</p>
        <p class="mt-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Rótulo · 12px</p>
      </div>

      <div class="card p-6">
        <h2 class="mb-5 font-bold text-navy-900">Botões, campos e etiquetas</h2>
        <div class="flex flex-wrap gap-3">
          <button class="btn btn-primary"><app-icon name="plus" [size]="17" /> Primário</button>
          <button class="btn btn-secondary">Secundário</button>
          <button class="btn btn-ghost">Discreto</button>
          <button class="btn btn-danger"><app-icon name="trash" [size]="16" /> Excluir</button>
        </div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="sg-ok">Campo</label>
            <input id="sg-ok" class="input" placeholder="Digite aqui" />
          </div>
          <div>
            <label class="label" for="sg-err">Campo com erro</label>
            <input id="sg-err" class="input input-invalid" value="abc" />
            <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Mensagem de validação.</p>
          </div>
        </div>
        <div class="mt-5 flex flex-wrap gap-2">
          <span class="badge bg-brand-50 text-brand-700">Futura</span>
          <span class="badge bg-emerald-50 text-emerald-700">Em andamento</span>
          <span class="badge bg-slate-100 text-slate-600">Realizada</span>
          <span class="badge bg-emerald-50 text-emerald-700"><app-icon name="trending-up" [size]="13" /> +0,42%</span>
          <span class="badge bg-red-50 text-red-700"><app-icon name="trending-down" [size]="13" /> -0,95%</span>
        </div>
        <div class="mt-5 flex flex-wrap gap-3 text-brand-600">
          @for (i of icons; track i) {
            <span class="grid size-10 place-items-center rounded-lg bg-brand-50"><app-icon [name]="i" /></span>
          }
        </div>
      </div>
    </section>

    <section class="mt-5">
      <h2 class="mb-1 font-bold text-navy-900">Estados dos cartões (falha parcial)</h2>
      <p class="mb-4 text-sm text-slate-500">
        Clima e câmbio carregam de forma independente: se um serviço falhar, o outro continua aparecendo.
      </p>
      <div class="grid gap-5 lg:grid-cols-3">
        <app-weather-card state="carregando" />
        <app-weather-card state="erro" />
        <app-exchange-card state="erro" [rate]="gbp" />
      </div>
    </section>
  `,
})
export class StyleGuide {
  protected readonly gbp = COTACOES['GBP'];
  protected readonly icons: IconName[] = ['sun', 'cloud-sun', 'cloud-rain', 'cloud-snow', 'wind', 'coins', 'wallet', 'plane-takeoff', 'map-pin', 'calendar'];
  protected readonly swatches: Swatch[] = [
    { name: 'Azul céu', hex: '#1D63F1', use: 'Ações e links', dark: true },
    { name: 'Azul claro', hex: '#3381FC', use: 'Gráficos e destaques', dark: true },
    { name: 'Azul-noite', hex: '#0B1B3F', use: 'Textos e fundos', dark: true },
    { name: 'Âmbar sol', hex: '#F59E0B', use: 'Câmbio e orçamento' },
    { name: 'Verde', hex: '#10B981', use: 'Sucesso e alta', dark: true },
    { name: 'Vermelho', hex: '#EF4444', use: 'Erros e queda', dark: true },
    { name: 'Fundo', hex: '#F4F7FB', use: 'Fundo das telas' },
    { name: 'Branco', hex: '#FFFFFF', use: 'Cartões' },
  ];
}
