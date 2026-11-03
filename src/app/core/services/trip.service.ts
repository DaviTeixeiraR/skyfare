import { computed, inject, Injectable, signal } from '@angular/core';
import { BusinessError } from '../errors';
import { VIAGENS } from '../mock/mock-data';
import { Trip, TripInput } from '../models';
import { normalizeText } from '../utils/text';
import { toDate, tripStatus, TripStatus } from '../utils/trip-utils';
import { CityService } from './city.service';
import { ExchangeService } from './exchange.service';

export type TripSort = 'data' | 'orcamento';

export interface TripQuery {
  texto: string;
  status: 'todas' | TripStatus;
  ordem: TripSort;
}

/** Regras de negócio das viagens: cadastro, consulta, edição e exclusão (lista em memória). */
@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly cities = inject(CityService);
  private readonly exchange = inject(ExchangeService);

  private readonly state = signal<Trip[]>(VIAGENS.map((t) => ({ ...t })));

  readonly trips = this.state.asReadonly();
  readonly total = computed(() => this.state().length);

  /** Quantidade de viagens de um usuário. */
  countByUser(userId: number): number {
    return this.listByUser(userId).length;
  }

  /** Viagens de um usuário. */
  listByUser(userId: number): Trip[] {
    return this.state().filter((t) => t.userId === userId);
  }

  getById(id: number): Trip | undefined {
    return this.state().find((t) => t.id === id);
  }

  /** Só devolve a viagem se ela pertence ao usuário (cada conta vê apenas as suas). */
  getOwnedBy(id: number, userId: number): Trip | undefined {
    const trip = this.getById(id);
    return trip?.userId === userId ? trip : undefined;
  }

  /** Pesquisa por cidade ou país, filtra pela situação e ordena. */
  search(userId: number, query: TripQuery): Trip[] {
    const q = normalizeText(query.texto);
    return this.listByUser(userId)
      .filter((t) => query.status === 'todas' || tripStatus(t) === query.status)
      .filter((t) => !q || normalizeText(`${t.cidade} ${t.pais}`).includes(q))
      .sort((a, b) =>
        query.ordem === 'orcamento'
          ? b.orcamentoBRL - a.orcamentoBRL
          : toDate(a.dataIda).getTime() - toDate(b.dataIda).getTime(),
      );
  }

  /** Mensagem de erro da regra de negócio, ou null se os dados são válidos. */
  validate(input: TripInput): string | null {
    if (!input.city) return 'Escolha uma cidade de destino.';
    if (!input.dataIda || !input.dataVolta) return 'Informe as datas de ida e de volta.';
    if (input.dataVolta < input.dataIda) return 'A data de volta não pode ser antes da ida.';
    if (!(input.orcamentoBRL > 0)) return 'O orçamento precisa ser maior que zero.';
    return null;
  }

  create(userId: number, input: TripInput): Trip {
    this.assertValid(input);
    const trip: Trip = {
      id: Math.max(0, ...this.state().map((t) => t.id)) + 1,
      userId,
      ...this.fromInput(input),
    };
    this.state.update((list) => [...list, trip]);
    return trip;
  }

  update(id: number, input: TripInput): Trip {
    const current = this.getById(id);
    if (!current) throw new BusinessError('Viagem não encontrada.');
    this.assertValid(input);
    const updated: Trip = { ...current, ...this.fromInput(input) };
    this.state.update((list) => list.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  remove(id: number): void {
    if (!this.getById(id)) throw new BusinessError('Viagem não encontrada.');
    this.state.update((list) => list.filter((t) => t.id !== id));
  }

  private assertValid(input: TripInput) {
    const error = this.validate(input);
    if (error) throw new BusinessError(error);
  }

  /** Monta os dados da viagem a partir da cidade escolhida no formulário. */
  private fromInput(input: TripInput): Omit<Trip, 'id' | 'userId'> {
    const { city } = input;
    return {
      cityId: city.id,
      cidade: city.nome,
      estado: city.estado,
      pais: city.pais,
      codigoPais: city.codigoPais,
      continente: this.cities.continentOf(city.codigoPais),
      moeda: this.exchange.currencyOf(city.codigoPais) || 'BRL',
      dataIda: input.dataIda,
      dataVolta: input.dataVolta,
      orcamentoBRL: input.orcamentoBRL,
      observacoes: input.observacoes.trim(),
    };
  }
}
