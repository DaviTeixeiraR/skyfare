import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/errors';
import { City } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CityService } from '../../core/services/city.service';
import { ExchangeService } from '../../core/services/exchange.service';
import { ToastService } from '../../core/services/toast.service';
import { TripService } from '../../core/services/trip.service';
import { CitySearch } from '../../shared/components/city-search';
import { Flag } from '../../shared/components/flag';
import { Icon } from '../../shared/components/icon';

function returnAfterDeparture(group: AbstractControl): ValidationErrors | null {
  const { dataIda, dataVolta } = group.value as { dataIda: string; dataVolta: string };
  return dataIda && dataVolta && dataVolta < dataIda ? { voltaAntesDaIda: true } : null;
}

/** Tela 6: cadastro e edição de viagem. */
@Component({
  selector: 'app-trip-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, CitySearch, Flag, Icon, CurrencyPipe],
  template: `
    @if (notFound()) {
      <div class="card flex flex-col items-center gap-3 p-12 text-center">
        <p class="font-semibold text-navy-900">Viagem não encontrada</p>
        <p class="text-sm text-slate-500">Ela pode ter sido excluída ou pertencer a outra conta.</p>
        <a routerLink="/viagens" class="btn btn-primary">Voltar para Minhas viagens</a>
      </div>
    } @else {
    <a routerLink="/viagens" class="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900">
      <app-icon name="arrow-left" [size]="16" /> Minhas viagens
    </a>
    <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">{{ editing() ? 'Editar viagem' : 'Nova viagem' }}</h1>
    <p class="mt-1 text-slate-500">
      {{ editing() ? 'Altere os dados e salve.' : 'Escolha o destino, as datas e quanto pretende gastar.' }}
    </p>

    <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <form class="card space-y-6 p-6 sm:p-8" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div>
          <span class="label">Destino</span>
          @if (city(); as c) {
            <div class="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3">
              <app-flag [code]="c.codigoPais" [size]="32" />
              <div class="min-w-0 flex-1">
                <p class="font-bold text-navy-900">{{ c.nome }}</p>
                <p class="text-sm text-slate-500">{{ c.estado }}, {{ c.pais }} · moeda {{ currency() }}</p>
              </div>
              <button type="button" class="btn btn-ghost !px-3 !py-1.5" (click)="city.set(null)">Trocar</button>
            </div>
          } @else {
            <app-city-search [compact]="true" placeholder="Digite a cidade de destino" (selected)="city.set($event)" />
            @if (submitted()) {
              <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Escolha uma cidade da lista.</p>
            }
          }
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="label" for="dataIda">Data de ida</label>
            <input id="dataIda" type="date" class="input" formControlName="dataIda" [class.input-invalid]="invalid('dataIda')" />
            @if (invalid('dataIda')) {
              <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Informe a data de ida.</p>
            }
          </div>
          <div>
            <label class="label" for="dataVolta">Data de volta</label>
            <input id="dataVolta" type="date" class="input" formControlName="dataVolta"
                   [class.input-invalid]="invalid('dataVolta') || form.hasError('voltaAntesDaIda')" />
            @if (form.hasError('voltaAntesDaIda')) {
              <p class="field-error"><app-icon name="circle-alert" [size]="14" /> A volta não pode ser antes da ida.</p>
            } @else if (invalid('dataVolta')) {
              <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Informe a data de volta.</p>
            }
          </div>
        </div>

        <div>
          <label class="label" for="orcamento">Orçamento total (R$)</label>
          <div class="relative">
            <span class="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-slate-400">R$</span>
            <input id="orcamento" type="number" min="0" step="100" class="input !pl-10" placeholder="0,00"
                   formControlName="orcamento" [class.input-invalid]="invalid('orcamento')" />
          </div>
          @if (invalid('orcamento')) {
            <p class="field-error"><app-icon name="circle-alert" [size]="14" /> O orçamento precisa ser maior que zero.</p>
          } @else {
            <p class="mt-1.5 text-xs text-slate-500">Vamos converter para a moeda do destino com a cotação do dia.</p>
          }
        </div>

        <div>
          <label class="label" for="observacoes">Observações <span class="font-normal text-slate-400">(opcional)</span></label>
          <textarea id="observacoes" rows="4" class="input resize-none" placeholder="Passeios, reservas, lembretes..."
                    formControlName="observacoes" [class.input-invalid]="form.controls.observacoes.invalid"></textarea>
          @if (form.controls.observacoes.hasError('maxlength')) {
            <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Use no máximo 300 caracteres.</p>
          } @else {
            <p class="mt-1.5 text-right text-xs text-slate-400">{{ value().observacoes?.length ?? 0 }}/300</p>
          }
        </div>

        <div class="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
          <a routerLink="/viagens" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary" [disabled]="saving()"><app-icon name="check" [size]="17" /> {{ editing() ? 'Salvar alterações' : 'Salvar viagem' }}</button>
        </div>
      </form>

      <aside class="space-y-5">
        <section class="card overflow-hidden">
          <div class="bg-gradient-to-br from-brand-600 to-navy-900 p-5 text-white">
            <p class="text-xs font-semibold tracking-wide text-brand-100 uppercase">Resumo</p>
            <p class="mt-1 text-xl font-extrabold">{{ city()?.nome ?? 'Destino não escolhido' }}</p>
            <p class="text-sm text-brand-100">{{ days() ? days() + ' dias de viagem' : 'Escolha as datas' }}</p>
          </div>
          <dl class="divide-y divide-slate-100 px-5 text-sm">
            <div class="flex justify-between py-3"><dt class="text-slate-500">Orçamento</dt>
              <dd class="font-bold text-navy-900">{{ budget() | currency: 'BRL' : 'symbol' : '1.2-2' }}</dd></div>
            <div class="flex justify-between py-3"><dt class="text-slate-500">Na moeda local</dt>
              <dd class="font-bold text-sun-600">
                @if (rate(); as r) { {{ budget() / r.cotacao | currency: r.codigo : 'symbol-narrow' : '1.2-2' }} }
                @else { — }
              </dd></div>
            <div class="flex justify-between py-3"><dt class="text-slate-500">Por dia</dt>
              <dd class="font-bold text-navy-900">{{ (days() ? budget() / days() : 0) | currency: 'BRL' : 'symbol' : '1.0-0' }}</dd></div>
            @if (rate(); as r) {
              <div class="flex justify-between py-3"><dt class="text-slate-500">Cotação usada</dt>
                <dd class="font-semibold text-slate-700">1 {{ r.codigo }} = {{ r.cotacao | currency: 'BRL' : 'symbol' : '1.2-4' }}</dd></div>
            }
          </dl>
        </section>
        <section class="card flex gap-3 p-5 text-sm text-slate-600">
          <app-icon name="info" [size]="18" class="mt-0.5 text-brand-600" />
          <p>A previsão do tempo cobre os próximos 7 dias. Para viagens mais distantes, o Skyfare mostra o clima atual do destino.</p>
        </section>
      </aside>
    </div>
    }
  `,
})
export class TripForm {
  /** Presente apenas na rota /viagens/:id/editar. */
  readonly id = input<string>();
  /** Vem de ?cidade=<id> (botão "Salvar como viagem" da busca): já escolhe o destino. */
  readonly cidade = input<string>();

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly trips = inject(TripService);
  private readonly cities = inject(CityService);
  private readonly exchange = inject(ExchangeService);
  private readonly toast = inject(ToastService);

  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly city = signal<City | null>(null);
  protected readonly editing = computed(() => !!this.id());

  /** Viagem em edição. Só existe se for do usuário logado. */
  private readonly current = computed(() =>
    this.editing() ? this.trips.getOwnedBy(Number(this.id()), this.auth.user()?.id ?? 0) : undefined,
  );
  protected readonly notFound = computed(() => this.editing() && !this.current());

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      dataIda: ['', Validators.required],
      dataVolta: ['', Validators.required],
      orcamento: [0, [Validators.required, Validators.min(1)]],
      observacoes: ['', Validators.maxLength(300)],
    },
    { validators: returnAfterDeparture },
  );

  protected readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly currency = computed(() => this.exchange.currencyOf(this.city()?.codigoPais ?? ''));
  protected readonly rate = computed(() => this.exchange.getRate(this.currency()));
  protected readonly budget = computed(() => Number(this.value().orcamento) || 0);
  protected readonly days = computed(() => {
    const { dataIda, dataVolta } = this.value();
    if (!dataIda || !dataVolta || dataVolta < dataIda) return 0;
    return (new Date(dataVolta).getTime() - new Date(dataIda).getTime()) / 86_400_000 + 1;
  });

  constructor() {
    // No cadastro, a cidade pode vir pré-escolhida pela URL.
    effect(() => {
      const preset = this.cities.getById(Number(this.cidade()));
      if (preset && !this.editing()) this.city.set(preset);
    });

    // No modo edição, preenche o formulário com a viagem existente.
    effect(() => {
      const trip = this.current();
      if (!trip) return;
      this.city.set(
        this.cities.getById(trip.cityId) ?? {
          id: trip.cityId,
          nome: trip.cidade,
          estado: trip.estado,
          pais: trip.pais,
          codigoPais: trip.codigoPais,
          latitude: 0,
          longitude: 0,
        },
      );
      this.form.setValue({
        dataIda: trip.dataIda,
        dataVolta: trip.dataVolta,
        orcamento: trip.orcamentoBRL,
        observacoes: trip.observacoes,
      });
    });
  }

  protected invalid(name: 'dataIda' | 'dataVolta' | 'orcamento') {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected submit() {
    this.submitted.set(true);
    const city = this.city();
    if (this.form.invalid || !city) {
      this.form.markAllAsTouched();
      return;
    }
    const { dataIda, dataVolta, orcamento, observacoes } = this.form.getRawValue();
    const input = { city, dataIda, dataVolta, orcamentoBRL: Number(orcamento), observacoes };
    const current = this.current();
    const request = current ? this.trips.update(current.id, input) : this.trips.create(this.auth.user()!.id, input);
    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.toast.success(current ? 'Viagem atualizada.' : 'Viagem cadastrada.');
        this.router.navigateByUrl('/viagens');
      },
      error: (e) => {
        this.saving.set(false);
        this.toast.error(errorMessage(e, 'Não foi possível salvar a viagem.'));
      },
    });
  }
}
