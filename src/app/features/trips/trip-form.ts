import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { City, Trip } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CityService } from '../../core/services/city.service';
import { ToastService } from '../../core/services/toast.service';
import { TripService } from '../../core/services/trip.service';
import { CitySearch } from '../../shared/components/city-search';
import { Flag } from '../../shared/components/flag';
import { Icon } from '../../shared/components/icon';

/** Validador do grupo: a volta não pode ser antes da ida. */
function returnAfterDeparture(group: AbstractControl) {
  const { dataIda, dataVolta } = group.value;
  return dataIda && dataVolta && dataVolta < dataIda ? { voltaAntesDaIda: true } : null;
}

/** Tela 6: cadastro e edição de viagem. */
@Component({
  selector: 'app-trip-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, CitySearch, Flag, Icon],
  template: `
    @if (notFound()) {
      <div class="card flex flex-col items-center gap-3 p-12 text-center">
        <p class="font-semibold text-navy-900">Viagem não encontrada</p>
        <a routerLink="/viagens" class="btn btn-primary">Voltar para Minhas viagens</a>
      </div>
    } @else {
      <a routerLink="/viagens" class="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900">
        <app-icon name="arrow-left" [size]="16" /> Minhas viagens
      </a>
      <h1 class="text-3xl font-extrabold tracking-tight text-navy-900">{{ trip ? 'Editar viagem' : 'Nova viagem' }}</h1>
      <p class="mt-1 text-slate-500">Escolha o destino, as datas e quanto pretende gastar.</p>

      <form class="card mt-6 max-w-3xl space-y-6 p-6 sm:p-8" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div>
          <span class="label">Destino</span>
          @if (form.controls.cidade.value; as c) {
            <div class="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3">
              <app-flag [code]="c.codigoPais" [size]="32" />
              <div class="min-w-0 flex-1">
                <p class="font-bold text-navy-900">{{ c.nome }}</p>
                <p class="text-sm text-slate-500">{{ c.estado }}, {{ c.pais }}</p>
              </div>
              <button type="button" class="btn btn-ghost !px-3 !py-1.5" (click)="form.controls.cidade.reset()">Trocar</button>
            </div>
          } @else {
            <app-city-search [compact]="true" placeholder="Digite a cidade de destino" (selected)="form.controls.cidade.setValue($event)" />
            @if (invalid('cidade')) {
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
          <input id="orcamento" type="number" class="input" placeholder="0,00" formControlName="orcamento"
                 [class.input-invalid]="invalid('orcamento')" />
          @if (invalid('orcamento')) {
            <p class="field-error"><app-icon name="circle-alert" [size]="14" /> O orçamento precisa ser maior que zero.</p>
          }
        </div>

        <div>
          <label class="label" for="observacoes">Observações <span class="font-normal text-slate-400">(opcional)</span></label>
          <textarea id="observacoes" rows="4" class="input resize-none" placeholder="Passeios, reservas, lembretes..."
                    formControlName="observacoes" [class.input-invalid]="invalid('observacoes')"></textarea>
          @if (invalid('observacoes')) {
            <p class="field-error"><app-icon name="circle-alert" [size]="14" /> Use no máximo 300 caracteres.</p>
          }
        </div>

        <div class="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
          <a routerLink="/viagens" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary"><app-icon name="check" [size]="17" /> {{ trip ? 'Salvar alterações' : 'Salvar viagem' }}</button>
        </div>
      </form>
    }
  `,
})
export class TripForm implements OnInit {
  /** Vem da rota /viagens/:id/editar (só existe na edição). */
  readonly id = input<string>();
  /** Vem de ?cidade=<id> (botão "Salvar como viagem" da busca): já escolhe o destino. */
  readonly cidade = input<string>();

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly trips = inject(TripService);
  private readonly cities = inject(CityService);
  private readonly toast = inject(ToastService);

  /** Viagem em edição (undefined no cadastro). */
  protected trip?: Trip;
  protected readonly notFound = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      cidade: new FormControl<City | null>(null, Validators.required),
      dataIda: ['', Validators.required],
      dataVolta: ['', Validators.required],
      orcamento: [0, [Validators.required, Validators.min(1)]],
      observacoes: ['', Validators.maxLength(300)],
    },
    { validators: returnAfterDeparture },
  );

  ngOnInit() {
    if (this.id()) {
      this.trip = this.trips.getOwnedBy(Number(this.id()), this.auth.user()!.id);
      if (!this.trip) {
        this.notFound.set(true);
        return;
      }
      this.form.patchValue({
        cidade: this.cities.getById(this.trip.cityId),
        dataIda: this.trip.dataIda,
        dataVolta: this.trip.dataVolta,
        orcamento: this.trip.orcamentoBRL,
        observacoes: this.trip.observacoes,
      });
    } else if (this.cidade()) {
      this.form.patchValue({ cidade: this.cities.getById(Number(this.cidade())) });
    }
  }

  protected invalid(name: 'cidade' | 'dataIda' | 'dataVolta' | 'orcamento' | 'observacoes') {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { cidade, dataIda, dataVolta, orcamento, observacoes } = this.form.getRawValue();
    const input = { city: cidade!, dataIda, dataVolta, orcamentoBRL: orcamento, observacoes };
    const request = this.trip ? this.trips.update(this.trip, input) : this.trips.create(this.auth.user()!.id, input);
    request.subscribe({
      next: () => {
        this.toast.success(this.trip ? 'Viagem atualizada.' : 'Viagem cadastrada.');
        this.router.navigateByUrl('/viagens');
      },
      error: () => this.toast.error('Não foi possível salvar a viagem.'),
    });
  }
}
