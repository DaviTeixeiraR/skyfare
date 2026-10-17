import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { CLIMA, CLIMA_PADRAO, COTACOES, VIAGENS } from '../../core/mock/mock-data';
import {
  daysUntil,
  STATUS_CLASS,
  STATUS_LABEL,
  tripDuration,
  tripStatus,
} from '../../core/utils/trip-utils';
import { ChartView } from '../../shared/components/chart';
import { ExchangeCard } from '../../shared/components/exchange-card';
import { Flag } from '../../shared/components/flag';
import { ForecastList } from '../../shared/components/forecast-list';
import { Icon } from '../../shared/components/icon';
import { WeatherCard } from '../../shared/components/weather-card';

/** Tela 5: detalhe da viagem. */
@Component({
  selector: 'app-trip-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Flag, Icon, WeatherCard, ExchangeCard, ForecastList, ChartView, CurrencyPipe, DatePipe],
  template: `
    @if (trip(); as t) {
      <a routerLink="/viagens" class="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900">
        <app-icon name="arrow-left" [size]="16" /> Minhas viagens
      </a>

      <header class="card flex flex-wrap items-center gap-5 p-6">
        <app-flag [code]="t.codigoPais" [size]="56" />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">{{ t.cidade }}</h1>
            <span class="badge" [class]="statusClass[status()]">{{ statusLabel[status()] }}</span>
          </div>
          <p class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span class="flex items-center gap-1"><app-icon name="map-pin" [size]="14" /> {{ t.estado }}, {{ t.pais }}</span>
            <span class="flex items-center gap-1"><app-icon name="calendar" [size]="14" />
              {{ t.dataIda + 'T12:00:00' | date: 'dd/MM/yyyy' }} a {{ t.dataVolta + 'T12:00:00' | date: 'dd/MM/yyyy' }}</span>
            <span class="flex items-center gap-1"><app-icon name="clock" [size]="14" /> {{ duration() }} dias</span>
          </p>
        </div>
        @if (status() === 'futura') {
          <div class="rounded-xl bg-brand-50 px-4 py-2.5 text-center">
            <p class="text-2xl font-extrabold text-brand-700">{{ countdown() }}</p>
            <p class="text-xs font-semibold text-brand-600">dias para embarcar</p>
          </div>
        }
        <div class="flex gap-2">
          <a [routerLink]="['/viagens', t.id, 'editar']" class="btn btn-secondary"><app-icon name="pencil" [size]="16" /> Editar</a>
          <button type="button" class="btn btn-danger"><app-icon name="trash" [size]="16" /> Excluir</button>
        </div>
      </header>

      <div class="mt-5 grid gap-5 lg:grid-cols-3">
        <div class="space-y-5 lg:col-span-2">
          <app-weather-card [weather]="weather()" />
          <app-forecast-list [days]="weather().diario" />

          @if (rate(); as r) {
            <section class="card p-6">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="flex items-center gap-2 font-bold text-navy-900">
                  <app-icon name="trending-up" [size]="18" class="text-sun-500" /> {{ r.nome }}: cotação em 30 dias
                </h3>
                <span class="text-xs text-slate-400">1 {{ r.codigo }} em reais</span>
              </div>
              <app-chart class="h-56" [config]="chart()" label="Variação da cotação em 30 dias" />
            </section>
          }
        </div>

        <aside class="space-y-5">
          <section class="card p-6">
            <h3 class="flex items-center gap-2 font-bold text-navy-900">
              <app-icon name="wallet" [size]="18" class="text-sun-500" /> Orçamento
            </h3>
            <p class="mt-4 text-sm text-slate-500">Total planejado</p>
            <p class="text-3xl font-extrabold tracking-tight text-navy-900">{{ t.orcamentoBRL | currency: 'BRL' : 'symbol' : '1.2-2' }}</p>
            @if (rate(); as r) {
              <p class="mt-1 text-lg font-bold text-sun-600">≈ {{ t.orcamentoBRL / r.cotacao | currency: r.codigo : 'symbol-narrow' : '1.2-2' }}</p>
            }
            <div class="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
              <div>
                <p class="text-xs text-slate-500">Por dia (BRL)</p>
                <p class="font-bold text-navy-900">{{ t.orcamentoBRL / duration() | currency: 'BRL' : 'symbol' : '1.0-0' }}</p>
              </div>
              @if (rate(); as r) {
                <div>
                  <p class="text-xs text-slate-500">Por dia ({{ r.codigo }})</p>
                  <p class="font-bold text-navy-900">{{ t.orcamentoBRL / duration() / r.cotacao | currency: r.codigo : 'symbol-narrow' : '1.0-0' }}</p>
                </div>
              }
            </div>
          </section>

          <app-exchange-card [rate]="rate()" [domestic]="t.moeda === 'BRL'" [showConverter]="true" />

          <section class="card p-6">
            <h3 class="flex items-center gap-2 font-bold text-navy-900">
              <app-icon name="pencil" [size]="18" class="text-brand-600" /> Observações
            </h3>
            <p class="mt-3 text-sm leading-relaxed text-slate-600">{{ t.observacoes }}</p>
          </section>
        </aside>
      </div>
    } @else {
      <div class="card flex flex-col items-center gap-3 p-12 text-center">
        <p class="font-semibold text-navy-900">Viagem não encontrada</p>
        <a routerLink="/viagens" class="btn btn-primary">Voltar para Minhas viagens</a>
      </div>
    }
  `,
})
export class TripDetail {
  /** Vem do parâmetro :id da rota (withComponentInputBinding). */
  readonly id = input<string>('1');

  protected readonly statusLabel = STATUS_LABEL;
  protected readonly statusClass = STATUS_CLASS;

  protected readonly trip = computed(() => VIAGENS.find((t) => t.id === Number(this.id())) ?? null);
  protected readonly weather = computed(() => CLIMA[this.trip()?.cityId ?? 0] ?? CLIMA_PADRAO);
  protected readonly rate = computed(() => COTACOES[this.trip()?.moeda ?? ''] ?? null);
  protected readonly status = computed(() => tripStatus(this.trip()!));
  protected readonly duration = computed(() => tripDuration(this.trip()!));
  protected readonly countdown = computed(() => daysUntil(this.trip()!.dataIda));

  protected readonly chart = computed<ChartConfiguration>(() => {
    const historico = this.rate()?.historico ?? [];
    return {
      type: 'line',
      data: {
        labels: historico.map((_, i) => (i === historico.length - 1 ? 'Hoje' : `-${historico.length - 1 - i}d`)),
        datasets: [
          {
            data: historico,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
          y: { grid: { color: '#eef2f7' }, ticks: { callback: (v) => 'R$ ' + Number(v).toFixed(Number(v) < 0.1 ? 4 : 2).replace('.', ',') } },
        },
      },
    };
  });
}
