import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Weather } from '../../core/models';
import { weatherInfo, WEATHER_GRADIENT } from '../../core/utils/weather-codes';
import { Icon } from './icon';

export type CardState = 'carregando' | 'erro' | 'ok';

/** Cartão de clima atual. Tem carregamento e erro próprios (falha parcial). */
@Component({
  selector: 'app-weather-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'block' },
  template: `
    @switch (state()) {
      @case ('carregando') {
        <div class="card h-full animate-pulse p-6">
          <div class="h-4 w-28 rounded bg-slate-200"></div>
          <div class="mt-6 h-14 w-36 rounded-lg bg-slate-200"></div>
          <div class="mt-4 h-4 w-44 rounded bg-slate-200"></div>
          <div class="mt-8 grid grid-cols-3 gap-3">
            <div class="h-14 rounded-xl bg-slate-100"></div>
            <div class="h-14 rounded-xl bg-slate-100"></div>
            <div class="h-14 rounded-xl bg-slate-100"></div>
          </div>
        </div>
      }
      @case ('erro') {
        <div class="card flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <div class="grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
            <app-icon name="cloud" />
          </div>
          <p class="font-semibold text-navy-900">Não foi possível carregar o clima</p>
          <p class="max-w-xs text-sm text-slate-500">
            O serviço de previsão do tempo não respondeu. A cotação continua disponível ao lado.
          </p>
          <button type="button" class="btn btn-secondary mt-1" (click)="retry.emit()">Tentar de novo</button>
        </div>
      }
      @default {
        @if (weather(); as w) {
          <div
            class="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg shadow-brand-900/15"
            [class]="gradient()"
          >
            <div class="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full bg-white/10"></div>
            <div class="pointer-events-none absolute -right-4 bottom-0 size-28 rounded-full bg-white/5"></div>

            <div class="relative flex items-center justify-between">
              <p class="flex items-center gap-1.5 text-sm font-semibold text-white/85">
                <app-icon name="thermometer" [size]="16" /> Clima agora
              </p>
              <p class="text-xs text-white/70">Open-Meteo</p>
            </div>

            <div class="relative mt-4 flex items-center justify-between gap-4">
              <div>
                <p class="text-6xl font-extrabold tracking-tighter">{{ w.atual.temperatura }}°</p>
                <p class="mt-1 text-lg font-semibold">{{ info().descricao }}</p>
                <p class="text-sm text-white/75">
                  Máx. {{ w.atual.maxima }}° · Mín. {{ w.atual.minima }}°
                </p>
              </div>
              <app-icon [name]="info().icone" [size]="84" [stroke]="1.4" class="text-white/95" />
            </div>

            <div class="relative mt-6 grid grid-cols-3 gap-2.5">
              <div class="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <p class="flex items-center gap-1 text-xs text-white/75"><app-icon name="thermometer" [size]="13" /> Sensação</p>
                <p class="mt-0.5 font-bold">{{ w.atual.sensacao }}°</p>
              </div>
              <div class="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <p class="flex items-center gap-1 text-xs text-white/75"><app-icon name="droplets" [size]="13" /> Umidade</p>
                <p class="mt-0.5 font-bold">{{ w.atual.umidade }}%</p>
              </div>
              <div class="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <p class="flex items-center gap-1 text-xs text-white/75"><app-icon name="wind" [size]="13" /> Vento</p>
                <p class="mt-0.5 font-bold">{{ w.atual.vento }} km/h</p>
              </div>
            </div>
          </div>
        }
      }
    }
  `,
})
export class WeatherCard {
  readonly weather = input<Weather | null>(null);
  readonly state = input<CardState>('ok');
  readonly retry = output<void>();

  protected readonly info = computed(() => weatherInfo(this.weather()?.atual.codigo ?? 3));
  protected readonly gradient = computed(() => WEATHER_GRADIENT[this.info().tema]);
}
