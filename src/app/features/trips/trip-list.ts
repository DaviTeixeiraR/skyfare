import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BusinessError } from '../../core/errors';
import { Trip } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ExchangeService } from '../../core/services/exchange.service';
import { ToastService } from '../../core/services/toast.service';
import { TripService, TripSort } from '../../core/services/trip.service';
import {
  daysUntil,
  STATUS_CLASS,
  STATUS_LABEL,
  tripDuration,
  tripStatus,
  TripStatus,
} from '../../core/utils/trip-utils';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';
import { Flag } from '../../shared/components/flag';
import { Icon } from '../../shared/components/icon';

type Filter = 'todas' | TripStatus;

/** Tela 4: listagem das viagens do usuário. */
@Component({
  selector: 'app-trip-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, Flag, Icon, ConfirmDialog, CurrencyPipe, DatePipe],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">Minhas viagens</h1>
        <p class="mt-1 text-slate-500">{{ trips().length }} {{ trips().length === 1 ? 'viagem cadastrada' : 'viagens cadastradas' }} · {{ futureCount() }} {{ futureCount() === 1 ? 'futura' : 'futuras' }}</p>
      </div>
      <a routerLink="/viagens/nova" class="btn btn-primary"><app-icon name="plus" [size]="17" /> Nova viagem</a>
    </div>

    <div class="card mt-6 flex flex-wrap items-center gap-3 p-3">
      <label class="relative min-w-60 flex-1">
        <app-icon name="search" [size]="18" class="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
        <input class="input !border-transparent !bg-slate-50 !pl-10" placeholder="Buscar por cidade ou país"
               [(ngModel)]="search" />
      </label>
      <div class="flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Filtrar por situação">
        @for (f of filters; track f.value) {
          <button type="button" role="tab" [attr.aria-selected]="filter() === f.value" (click)="filter.set(f.value)"
                  class="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors"
                  [class]="filter() === f.value ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-900'">
            {{ f.label }}
          </button>
        }
      </div>
      <label class="flex items-center gap-2 text-sm font-medium text-slate-500">
        <app-icon name="arrow-up-down" [size]="16" />
        <select class="input !w-auto !py-2" [(ngModel)]="sort">
          <option value="data">Data de ida</option>
          <option value="orcamento">Maior orçamento</option>
        </select>
      </label>
    </div>

    <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      @for (trip of visible(); track trip.id) {
        <article class="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
          <a [routerLink]="['/viagens', trip.id]" class="relative block h-28 bg-gradient-to-br p-5 text-white" [class]="gradient(trip)">
            <div class="pointer-events-none absolute -top-8 -right-6 size-28 rounded-full bg-white/10"></div>
            <span class="badge absolute top-4 right-4 !bg-white/90" [class]="statusClass[status(trip)]">{{ statusLabel[status(trip)] }}</span>
            <div class="absolute bottom-4 left-5 flex items-center gap-3">
              <app-flag [code]="trip.codigoPais" [size]="34" />
              <div>
                <h2 class="text-xl font-extrabold tracking-tight">{{ trip.cidade }}</h2>
                <p class="text-sm text-white/80">{{ trip.pais }}</p>
              </div>
            </div>
          </a>

          <div class="flex flex-1 flex-col gap-4 p-5">
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-1.5 font-medium text-slate-600">
                <app-icon name="calendar" [size]="16" class="text-slate-400" />
                {{ trip.dataIda + 'T12:00:00' | date: 'dd/MM' }} – {{ trip.dataVolta + 'T12:00:00' | date: 'dd/MM/yyyy' }}
              </span>
              <span class="text-slate-500">{{ duration(trip) }} dias</span>
            </div>

            <div class="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p class="text-xs text-slate-500">Orçamento</p>
                <p class="font-bold text-navy-900">{{ trip.orcamentoBRL | currency: 'BRL' : 'symbol' : '1.0-0' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500">Na moeda local</p>
                @if (trip.moeda === 'BRL') {
                  <p class="font-bold text-slate-400">Sem conversão</p>
                } @else {
                  <p class="font-bold text-sun-600">{{ local(trip) | currency: trip.moeda : 'symbol-narrow' : '1.0-0' }}</p>
                }
              </div>
            </div>

            <div class="mt-auto flex items-center justify-between">
              @if (status(trip) === 'futura') {
                <span class="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  <app-icon name="hourglass" [size]="15" /> Faltam {{ countdown(trip) }} dias
                </span>
              } @else {
                <span class="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <app-icon name="circle-check" [size]="15" /> Viagem concluída
                </span>
              }
              <div class="flex gap-1">
                <a [routerLink]="['/viagens', trip.id, 'editar']" class="btn btn-ghost !p-2" aria-label="Editar viagem" title="Editar">
                  <app-icon name="pencil" [size]="16" />
                </a>
                <button type="button" class="btn btn-ghost !p-2 hover:!bg-red-50 hover:!text-red-600" aria-label="Excluir viagem" title="Excluir" (click)="askDelete(trip)">
                  <app-icon name="trash" [size]="16" />
                </button>
                <a [routerLink]="['/viagens', trip.id]" class="btn btn-ghost !p-2" aria-label="Ver detalhes" title="Ver detalhes">
                  <app-icon name="chevron-right" [size]="16" />
                </a>
              </div>
            </div>
          </div>
        </article>
      } @empty {
        <div class="card col-span-full flex flex-col items-center gap-3 p-12 text-center">
          <div class="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600"><app-icon name="luggage" [size]="26" /></div>
          @if (trips().length === 0) {
            <p class="font-semibold text-navy-900">Você ainda não cadastrou nenhuma viagem</p>
            <p class="text-sm text-slate-500">Escolha um destino e comece a planejar o orçamento.</p>
            <a routerLink="/viagens/nova" class="btn btn-primary"><app-icon name="plus" [size]="17" /> Cadastrar viagem</a>
          } @else {
            <p class="font-semibold text-navy-900">Nenhuma viagem encontrada</p>
            <p class="text-sm text-slate-500">Tente outro filtro ou cadastre uma nova viagem.</p>
          }
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="!!toDelete()"
      heading="Excluir viagem?"
      [message]="'A viagem para ' + (toDelete()?.cidade ?? '') + ' será removida da sua lista. Esta ação não pode ser desfeita.'"
      (confirmed)="confirmDelete()"
      (cancelled)="toDelete.set(null)"
    />
  `,
})
export class TripList {
  private readonly auth = inject(AuthService);
  private readonly tripService = inject(TripService);
  private readonly exchange = inject(ExchangeService);
  private readonly toast = inject(ToastService);

  protected readonly statusLabel = STATUS_LABEL;
  protected readonly statusClass = STATUS_CLASS;

  protected readonly filters: { value: Filter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'futura', label: 'Futuras' },
    { value: 'realizada', label: 'Realizadas' },
  ];
  protected readonly search = signal('');
  protected readonly filter = signal<Filter>('todas');
  protected readonly sort = signal<TripSort>('data');
  /** Viagem aguardando confirmação de exclusão. */
  protected readonly toDelete = signal<Trip | null>(null);

  private readonly userId = computed(() => this.auth.user()?.id ?? 0);
  protected readonly trips = computed(() => this.tripService.listByUser(this.userId()));
  protected readonly futureCount = computed(() => this.trips().filter((t) => tripStatus(t) === 'futura').length);
  protected readonly visible = computed(() =>
    this.tripService.search(this.userId(), {
      texto: this.search(),
      status: this.filter(),
      ordem: this.sort(),
    }),
  );

  protected status = (t: Trip) => tripStatus(t);
  protected duration = (t: Trip) => tripDuration(t);
  protected countdown = (t: Trip) => daysUntil(t.dataIda);
  protected local = (t: Trip) => this.exchange.fromBRL(t.orcamentoBRL, t.moeda);
  protected gradient = (t: Trip) =>
    tripStatus(t) === 'realizada'
      ? 'from-slate-500 to-navy-700'
      : ({
          Europa: 'from-brand-500 to-brand-800',
          'América do Sul': 'from-sky-500 to-brand-700',
          Ásia: 'from-indigo-500 to-navy-800',
        } as Record<string, string>)[t.continente] ?? 'from-brand-500 to-navy-800';

  protected askDelete(trip: Trip) {
    this.toDelete.set(trip);
  }

  protected confirmDelete() {
    const trip = this.toDelete();
    if (!trip) return;
    try {
      this.tripService.remove(trip.id);
      this.toast.success(`Viagem para ${trip.cidade} excluída.`);
    } catch (e) {
      this.toast.error(e instanceof BusinessError ? e.message : 'Não foi possível excluir a viagem.');
    }
    this.toDelete.set(null);
  }
}
