import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Trip } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { TripService } from '../../core/services/trip.service';
import { UserService } from '../../core/services/user.service';
import { WeatherService } from '../../core/services/weather.service';
import { daysUntil, toDate, today, tripStatus } from '../../core/utils/trip-utils';
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
    <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">Dashboard</h1>
    <p class="mt-1 text-slate-500">Resumo das suas viagens.</p>

    <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <app-stat-card icon="plane-takeoff" label="Viagens planejadas" [value]="planned.length + ''" [hint]="planned.length ? 'Próxima em ' + nextDays + ' dias' : 'Nenhuma viagem futura'" />
      <app-stat-card icon="circle-check" label="Viagens realizadas" [value]="done.length + ''" hint="Já concluídas" tone="bg-emerald-50 text-emerald-600" />
      <app-stat-card icon="wallet" label="Orçamento planejado" [value]="plannedBudget" hint="Soma das viagens futuras" tone="bg-sun-50 text-sun-600" />
      <app-stat-card icon="coins" label="Média por viagem" [value]="averageBudget" hint="Considerando todas as viagens" tone="bg-indigo-50 text-indigo-600" />
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-3">
      <section class="card p-6 lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-bold text-navy-900">Orçamento por mês de embarque</h2>
          <span class="text-xs text-slate-400">próximos 12 meses</span>
        </div>
        <app-chart class="h-64" [config]="monthsChart" label="Orçamento por mês" />
      </section>
      <section class="card p-6">
        <h2 class="mb-4 font-bold text-navy-900">Viagens por continente</h2>
        <app-chart class="h-64" [config]="continentChart" label="Viagens por continente" />
      </section>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-3">
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
          } @empty {
            <li class="text-sm text-slate-500">Nenhuma viagem futura.</li>
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
              <p class="mt-1 text-3xl font-extrabold text-navy-900">{{ userService.users().length }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">Usuários ativos</p>
              <p class="mt-1 text-3xl font-extrabold text-emerald-600">{{ userService.activeCount() }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-sm text-slate-500">Viagens no sistema</p>
              <p class="mt-1 text-3xl font-extrabold text-brand-700">{{ tripService.trips().length }}</p>
            </div>
          </div>
        </section>
      }
    </div>
  `,
})
export class Dashboard {
  protected readonly tripService = inject(TripService);
  protected readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly weatherService = inject(WeatherService);

  protected readonly isAdmin = this.auth.isAdmin();

  /** Viagens do usuário logado (a tela é recriada a cada visita, então já vem atualizada). */
  private readonly trips = this.tripService.listByUser(this.auth.user()!.id);

  protected readonly planned = this.trips
    .filter((t) => tripStatus(t) === 'futura')
    .sort((a, b) => toDate(a.dataIda).getTime() - toDate(b.dataIda).getTime());
  protected readonly done = this.trips.filter((t) => tripStatus(t) === 'realizada');
  protected readonly nextDays = this.planned[0] ? daysUntil(this.planned[0].dataIda) : 0;
  protected readonly plannedBudget = brl.format(this.planned.reduce((soma, t) => soma + t.orcamentoBRL, 0));
  protected readonly averageBudget = brl.format(
    this.trips.reduce((soma, t) => soma + t.orcamentoBRL, 0) / (this.trips.length || 1),
  );

  protected countdown = (t: Trip) => daysUntil(t.dataIda);
  protected weatherIcon = (t: Trip) => weatherInfo(this.weatherService.getByCity(t.cityId).atual.codigo).icone;
  protected temperature = (t: Trip) => this.weatherService.getByCity(t.cityId).atual.temperatura;

  /** Gráfico de barras: orçamento das viagens que embarcam em cada um dos próximos 12 meses. */
  protected readonly monthsChart: ChartConfiguration = (() => {
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = 0; i < 12; i++) {
      const mes = new Date(today().getFullYear(), today().getMonth() + i, 1);
      labels.push(`${MESES[mes.getMonth()]}/${String(mes.getFullYear()).slice(2)}`);
      const doMes = this.trips.filter((t) => {
        const ida = toDate(t.dataIda);
        return ida.getMonth() === mes.getMonth() && ida.getFullYear() === mes.getFullYear();
      });
      values.push(doMes.reduce((soma, t) => soma + t.orcamentoBRL, 0));
    }
    return {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: '#3381fc', borderRadius: 8, maxBarThickness: 34 }] },
      options: {
        animation: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => brl.format(c.parsed.y ?? 0) } } },
        scales: { y: { ticks: { callback: (v) => 'R$ ' + Number(v) / 1000 + ' mil' } } },
      },
    };
  })();

  /** Gráfico de rosca: quantas viagens há em cada continente. */
  protected readonly continentChart: ChartConfiguration = (() => {
    const contagem = new Map<string, number>();
    this.trips.forEach((t) => contagem.set(t.continente, (contagem.get(t.continente) ?? 0) + 1));
    return {
      type: 'doughnut',
      data: {
        labels: [...contagem.keys()],
        datasets: [
          {
            data: [...contagem.values()],
            backgroundColor: ['#3381fc', '#f59e0b', '#0b1b3f', '#14b8a6', '#ef4444', '#8b5cf6'],
          },
        ],
      },
      options: { animation: false, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    };
  })();
}
