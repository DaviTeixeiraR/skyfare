import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import {
  CIDADES_MAIS_PESQUISADAS,
  CLIMA,
  CLIMA_PADRAO,
  COTACOES,
  USUARIO_LOGADO,
  USUARIOS,
  VIAGENS,
} from '../../core/mock/mock-data';
import { Trip } from '../../core/models';
import { daysUntil, toDate, tripStatus } from '../../core/utils/trip-utils';
import { weatherInfo } from '../../core/utils/weather-codes';
import { ChartView } from '../../shared/components/chart';
import { Flag } from '../../shared/components/flag';
import { Icon } from '../../shared/components/icon';
import { StatCard } from '../../shared/components/stat-card';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** Tela 7: dashboard de relatórios. */
@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatCard, ChartView, Flag, Icon],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">Dashboard</h1>
        <p class="mt-1 text-slate-500">Resumo das suas viagens e das moedas dos seus destinos.</p>
      </div>
      <span class="badge bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">
        <app-icon name="calendar" [size]="14" /> Atualizado em 18/10/2026
      </span>
    </div>

    <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <app-stat-card icon="plane-takeoff" label="Viagens planejadas" [value]="planned.length + ''" hint="Próxima em {{ nextDays }} dias" />
      <app-stat-card icon="circle-check" label="Viagens realizadas" [value]="done.length + ''" hint="Em 2026" tone="bg-emerald-50 text-emerald-600" />
      <app-stat-card icon="wallet" label="Orçamento planejado" [value]="plannedBudget" hint="Soma das viagens futuras" tone="bg-sun-50 text-sun-600" />
      <app-stat-card icon="coins" label="Média por viagem" [value]="averageBudget" hint="Considerando todas as viagens" tone="bg-indigo-50 text-indigo-600" />
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-3">
      <section class="card p-6 lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-bold text-navy-900">Orçamento por mês de embarque</h2>
          <span class="text-xs text-slate-400">jun/2026 a jul/2027</span>
        </div>
        <app-chart class="h-64" [config]="monthsChart" label="Orçamento por mês" />
      </section>
      <section class="card p-6">
        <h2 class="mb-4 font-bold text-navy-900">Viagens por continente</h2>
        <app-chart class="h-64" [config]="continentChart" label="Viagens por continente" />
      </section>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-3">
      <section class="card p-6 lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-bold text-navy-900">Variação das moedas dos próximos destinos</h2>
          <span class="text-xs text-slate-400">Últimos 30 dias, em %</span>
        </div>
        <app-chart class="h-64" [config]="currencyChart" label="Variação das moedas em 30 dias" />
      </section>

      <section class="card p-6">
        <h2 class="mb-4 font-bold text-navy-900">Próximas viagens</h2>
        <ul class="space-y-3">
          @for (t of planned; track t.id) {
            <li>
              <a [routerLink]="['/viagens', t.id]" class="flex items-center gap-3 rounded-xl p-2 -m-2 hover:bg-slate-50">
                <app-flag [code]="t.codigoPais" [size]="30" />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-semibold text-navy-900">{{ t.cidade }}</p>
                  <p class="text-xs text-slate-500">em {{ countdown(t) }} dias</p>
                </div>
                <span class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <app-icon [name]="weatherIcon(t)" [size]="18" class="text-brand-600" /> {{ temperature(t) }}°
                </span>
              </a>
            </li>
          }
        </ul>
      </section>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-3">
      <section class="card p-6">
        <h2 class="mb-4 font-bold text-navy-900">Cidades mais pesquisadas</h2>
        <ul class="space-y-3.5">
          @for (c of topCities; track c.cidade; let i = $index) {
            <li>
              <div class="mb-1 flex justify-between text-sm">
                <span class="font-semibold text-navy-900">{{ i + 1 }}. {{ c.cidade }} <span class="font-normal text-slate-400">· {{ c.pais }}</span></span>
                <span class="text-slate-500">{{ c.buscas }} buscas</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div class="h-2 rounded-full bg-brand-500" [style.width.%]="(c.buscas / topCities[0].buscas) * 100"></div>
              </div>
            </li>
          }
        </ul>
      </section>

      @if (isAdmin) {
        <section class="card p-6 lg:col-span-2">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="flex items-center gap-2 font-bold text-navy-900">
              <app-icon name="shield" [size]="18" class="text-brand-600" /> Visão do administrador
            </h2>
            <a routerLink="/admin/usuarios" class="text-sm font-semibold text-brand-600 hover:text-brand-700">Gerenciar usuários</a>
          </div>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">Usuários cadastrados</p>
              <p class="mt-1 text-3xl font-extrabold text-navy-900">{{ users.length }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">Usuários ativos</p>
              <p class="mt-1 text-3xl font-extrabold text-emerald-600">{{ activeUsers }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">Viagens no sistema</p>
              <p class="mt-1 text-3xl font-extrabold text-brand-700">{{ totalTrips }}</p>
            </div>
          </div>
          <p class="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <app-icon name="info" [size]="14" /> Este bloco só aparece para usuários com perfil de administrador.
          </p>
        </section>
      }
    </div>
  `,
})
export class Dashboard {
  protected readonly isAdmin = USUARIO_LOGADO.perfil === 'admin';
  protected readonly users = USUARIOS;
  protected readonly activeUsers = USUARIOS.filter((u) => u.ativo).length;
  protected readonly totalTrips = USUARIOS.reduce((sum, u) => sum + u.viagens, 0);
  protected readonly topCities = CIDADES_MAIS_PESQUISADAS;

  protected readonly planned = VIAGENS.filter((t) => tripStatus(t) === 'futura').sort(
    (a, b) => toDate(a.dataIda).getTime() - toDate(b.dataIda).getTime(),
  );
  protected readonly done = VIAGENS.filter((t) => tripStatus(t) === 'realizada');
  protected readonly nextDays = daysUntil(this.planned[0].dataIda);
  protected readonly plannedBudget = brl.format(this.planned.reduce((s, t) => s + t.orcamentoBRL, 0));
  protected readonly averageBudget = brl.format(
    VIAGENS.reduce((s, t) => s + t.orcamentoBRL, 0) / VIAGENS.length,
  );

  protected countdown = (t: Trip) => daysUntil(t.dataIda);
  protected weatherIcon = (t: Trip) => weatherInfo((CLIMA[t.cityId] ?? CLIMA_PADRAO).atual.codigo).icone;
  protected temperature = (t: Trip) => (CLIMA[t.cityId] ?? CLIMA_PADRAO).atual.temperatura;

  protected readonly monthsChart: ChartConfiguration = (() => {
    const labels: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(2026, 5 + i, 1);
      labels.push(`${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`);
      const trips = VIAGENS.filter((t) => {
        const ida = toDate(t.dataIda);
        return ida.getMonth() === d.getMonth() && ida.getFullYear() === d.getFullYear();
      });
      values.push(trips.reduce((s, t) => s + t.orcamentoBRL, 0));
      colors.push(trips.some((t) => tripStatus(t) === 'realizada') ? '#94a3b8' : '#3381fc');
    }
    return {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 8, maxBarThickness: 34 }] },
      options: {
        animation: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => brl.format(c.parsed.y ?? 0) } },
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#eef2f7' }, ticks: { callback: (v) => 'R$ ' + Number(v) / 1000 + ' mil' } },
        },
      },
    };
  })();

  protected readonly continentChart: ChartConfiguration = (() => {
    const counts = new Map<string, number>();
    VIAGENS.forEach((t) => counts.set(t.continente, (counts.get(t.continente) ?? 0) + 1));
    return {
      type: 'doughnut',
      data: {
        labels: [...counts.keys()],
        datasets: [
          {
            data: [...counts.values()],
            backgroundColor: ['#3381fc', '#f59e0b', '#0b1b3f', '#14b8a6'],
            borderWidth: 3,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 16 } } },
      },
    };
  })();

  protected readonly currencyChart: ChartConfiguration = (() => {
    const palette = ['#3381fc', '#f59e0b', '#14b8a6', '#0b1b3f'];
    const codes = [...new Set(this.planned.map((t) => t.moeda))].filter((c) => COTACOES[c]);
    return {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => (i === 29 ? 'Hoje' : `-${29 - i}d`)),
        datasets: codes.map((code, i) => {
          const h = COTACOES[code].historico;
          return {
            label: code,
            data: h.map((v) => +(((v - h[0]) / h[0]) * 100).toFixed(2)),
            borderColor: palette[i % palette.length],
            backgroundColor: palette[i % palette.length],
            tension: 0.35,
            pointRadius: 0,
            borderWidth: 2.2,
          };
        }),
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 14 } } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
          y: { grid: { color: '#eef2f7' }, ticks: { callback: (v) => v + '%' } },
        },
      },
    };
  })();
}
