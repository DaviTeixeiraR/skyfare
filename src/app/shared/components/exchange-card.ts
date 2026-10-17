import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ExchangeRate } from '../../core/models';
import { Icon } from './icon';
import { CardState } from './weather-card';

/** Cartão de câmbio: cotação em reais, variação, mini gráfico e conversor. */
@Component({
  selector: 'app-exchange-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, CurrencyPipe, DecimalPipe],
  host: { class: 'block' },
  template: `
    @switch (state()) {
      @case ('carregando') {
        <div class="card h-full animate-pulse p-6">
          <div class="h-4 w-32 rounded bg-slate-200"></div>
          <div class="mt-6 h-12 w-48 rounded-lg bg-slate-200"></div>
          <div class="mt-4 h-4 w-24 rounded bg-slate-200"></div>
          <div class="mt-8 h-16 rounded-xl bg-slate-100"></div>
        </div>
      }
      @case ('erro') {
        <div class="card flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <div class="grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
            <app-icon name="coins" />
          </div>
          <p class="font-semibold text-navy-900">Cotação indisponível no momento</p>
          <p class="max-w-xs text-sm text-slate-500">
            Não conseguimos falar com o serviço de câmbio. O clima continua funcionando normalmente.
          </p>
          <button type="button" class="btn btn-secondary mt-1" (click)="retry.emit()">Tentar de novo</button>
        </div>
      }
      @default {
        <div class="card h-full p-6">
          <div class="flex items-center justify-between">
            <p class="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
              <app-icon name="coins" [size]="16" class="text-sun-500" /> Câmbio
            </p>
            <p class="text-xs text-slate-400">AwesomeAPI</p>
          </div>

          @if (domestic()) {
            <div class="mt-5 flex items-start gap-4">
              <div class="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <app-icon name="circle-check" [size]="24" />
              </div>
              <div>
                <p class="text-lg font-bold text-navy-900">Destino no Brasil</p>
                <p class="mt-1 text-sm text-slate-500">
                  A moeda local é o real (BRL). Não é preciso converter valores para esta viagem.
                </p>
              </div>
            </div>
          } @else if (rate(); as r) {
            <div class="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-slate-500">1 {{ r.codigo }} · {{ r.nome }}</p>
                <p class="mt-1 text-4xl font-extrabold tracking-tight text-navy-900">
                  {{ r.cotacao | currency: 'BRL' : 'symbol' : digits() }}
                </p>
              </div>
              <span class="badge" [class]="r.variacao >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
                <app-icon [name]="r.variacao >= 0 ? 'trending-up' : 'trending-down'" [size]="14" />
                {{ r.variacao >= 0 ? '+' : '' }}{{ r.variacao | number: '1.2-2' }}% hoje
              </span>
            </div>

            <svg viewBox="0 0 300 64" class="mt-4 h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#f59e0b" stop-opacity="0.28" />
                  <stop offset="1" stop-color="#f59e0b" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path [attr.d]="sparkArea()" fill="url(#spark-fill)" />
              <path [attr.d]="sparkLine()" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linejoin="round" />
            </svg>
            <p class="mt-1 flex justify-between text-xs text-slate-400">
              <span>30 dias atrás</span><span>Atualizado em {{ r.atualizadoEm }}</span>
            </p>

            @if (showConverter()) {
              <div class="mt-5 rounded-xl bg-sun-50 p-4">
                <p class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-sun-700">
                  <app-icon name="arrow-right-left" [size]="16" /> Conversor
                </p>
                <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-500">Reais (BRL)</span>
                    <input
                      class="input bg-white"
                      type="number"
                      min="0"
                      [value]="amount()"
                      (input)="amount.set(+$any($event.target).value)"
                    />
                  </label>
                  <app-icon name="arrow-right-left" [size]="16" class="mt-5 text-slate-400" />
                  <div>
                    <span class="mb-1 block text-xs font-medium text-slate-500">{{ r.nome }} ({{ r.codigo }})</span>
                    <p class="rounded-xl border border-sun-100 bg-white px-3.5 py-2.5 text-sm font-bold text-navy-900">
                      {{ converted() | currency: r.codigo : 'symbol-narrow' : '1.2-2' }}
                    </p>
                  </div>
                </div>
              </div>
            }
          } @else {
            <div class="mt-5 flex items-start gap-4">
              <div class="grid size-12 shrink-0 place-items-center rounded-xl bg-sun-50 text-sun-600">
                <app-icon name="info" [size]="24" />
              </div>
              <div>
                <p class="text-lg font-bold text-navy-900">Moeda sem cotação</p>
                <p class="mt-1 text-sm text-slate-500">
                  A AwesomeAPI não tem cotação para a moeda deste país.
                </p>
              </div>
            </div>
          }
        </div>
      }
    }
  `,
})
export class ExchangeCard {
  readonly rate = input<ExchangeRate | null>(null);
  readonly domestic = input(false);
  readonly state = input<CardState>('ok');
  readonly showConverter = input(false);
  readonly retry = output<void>();

  protected readonly amount = signal(1000);
  protected readonly converted = computed(() => this.amount() / (this.rate()?.cotacao ?? 1));
  protected readonly digits = computed(() => ((this.rate()?.cotacao ?? 1) < 0.1 ? '1.4-4' : '1.2-2'));

  private readonly points = computed(() => {
    const h = this.rate()?.historico ?? [];
    if (h.length < 2) return [];
    const min = Math.min(...h);
    const max = Math.max(...h);
    const range = max - min || 1;
    return h.map((v, i) => [(i / (h.length - 1)) * 300, 58 - ((v - min) / range) * 50] as const);
  });
  protected readonly sparkLine = computed(() =>
    this.points().map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' '),
  );
  protected readonly sparkArea = computed(() =>
    this.points().length ? `${this.sparkLine()} L300 64 L0 64 Z` : '',
  );
}
