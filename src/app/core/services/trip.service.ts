import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap, throwError } from 'rxjs';
import { API_URL } from '../api';
import { BusinessError, friendlyError } from '../errors';
import { Trip, TripInput } from '../models';
import { normalizeText } from '../utils/text';
import { toDate, tripStatus, TripStatus } from '../utils/trip-utils';
import { CityService } from './city.service';

export type TripSort = 'data' | 'orcamento';

export interface TripQuery {
  texto: string;
  status: 'todas' | TripStatus;
  ordem: TripSort;
}

const URL = `${API_URL}/trips`;

/** Regras de negócio das viagens: cadastro, consulta, edição e exclusão pela API (coleção trips). */
@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly http = inject(HttpClient);
  private readonly cities = inject(CityService);

  private readonly state = signal<Trip[]>([]);

  readonly trips = this.state.asReadonly();
  readonly total = computed(() => this.state().length);

  /** Busca as viagens na API (GET /trips). */
  load(): Observable<void> {
    return this.http.get<Trip[]>(URL).pipe(
      tap((list) => this.state.set(list)),
      map(() => undefined),
      friendlyError('Não foi possível carregar as viagens.'),
    );
  }

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

  /** Cadastra a viagem (POST /trips). */
  create(userId: number, input: TripInput): Observable<Trip> {
    const error = this.validate(input);
    if (error) return throwError(() => new BusinessError(error));
    return this.http.post<Trip>(URL, { userId, ...this.fromInput(input) }).pipe(
      tap((trip) => this.state.update((list) => [...list, trip])),
      friendlyError('Não foi possível cadastrar a viagem.'),
    );
  }

  /** Salva a viagem editada (PUT /trips/:id). */
  update(id: number, input: TripInput): Observable<Trip> {
    const current = this.getById(id);
    if (!current) return throwError(() => new BusinessError('Viagem não encontrada.'));
    const error = this.validate(input);
    if (error) return throwError(() => new BusinessError(error));
    const updated: Trip = { ...current, ...this.fromInput(input) };
    return this.http.put<Trip>(`${URL}/${id}`, updated).pipe(
      tap((trip) => this.state.update((list) => list.map((t) => (t.id === id ? trip : t)))),
      friendlyError('Não foi possível salvar a viagem.'),
    );
  }

  /** Exclui a viagem (DELETE /trips/:id). */
  remove(id: number): Observable<void> {
    if (!this.getById(id)) return throwError(() => new BusinessError('Viagem não encontrada.'));
    return this.http.delete<void>(`${URL}/${id}`).pipe(
      tap(() => this.state.update((list) => list.filter((t) => t.id !== id))),
      friendlyError('Não foi possível excluir a viagem.'),
    );
  }

  /** Tira da lista as viagens de um usuário excluído (a API já apagou essas viagens). */
  forgetUser(userId: number): void {
    this.state.update((list) => list.filter((t) => t.userId !== userId));
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
      moeda: this.cities.currencyOf(city.codigoPais) || 'BRL',
      dataIda: input.dataIda,
      dataVolta: input.dataVolta,
      orcamentoBRL: input.orcamentoBRL,
      observacoes: input.observacoes.trim(),
    };
  }
}
