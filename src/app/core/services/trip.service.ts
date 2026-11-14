import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from '../api';
import { Trip, TripInput } from '../models';
import { normalizeText } from '../utils/text';
import { toDate, tripStatus, TripStatus } from '../utils/trip-utils';
import { CityService } from './city.service';

export interface TripQuery {
  texto: string;
  status: 'todas' | TripStatus;
  ordem: 'data' | 'orcamento';
}

const URL = `${API_URL}/trips`;

/** Viagens na API: listar, pesquisar, cadastrar, editar e excluir. */
@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly http = inject(HttpClient);
  private readonly cities = inject(CityService);

  readonly trips = signal<Trip[]>([]);

  /** GET /trips */
  load() {
    return this.http.get<Trip[]>(URL).pipe(tap((list) => this.trips.set(list)));
  }

  listByUser(userId: number) {
    return this.trips().filter((t) => t.userId === userId);
  }

  /** Só devolve a viagem se ela é do usuário (cada conta vê apenas as suas). */
  getOwnedBy(id: number, userId: number) {
    return this.listByUser(userId).find((t) => t.id === id);
  }

  /** Pesquisa por cidade ou país, filtra pela situação e ordena. */
  search(userId: number, query: TripQuery) {
    const q = normalizeText(query.texto);
    return this.listByUser(userId)
      .filter((t) => query.status === 'todas' || tripStatus(t) === query.status)
      .filter((t) => normalizeText(`${t.cidade} ${t.pais}`).includes(q))
      .sort((a, b) =>
        query.ordem === 'orcamento'
          ? b.orcamentoBRL - a.orcamentoBRL
          : toDate(a.dataIda).getTime() - toDate(b.dataIda).getTime(),
      );
  }

  /** POST /trips */
  create(userId: number, input: TripInput) {
    return this.http.post<Trip>(URL, { userId, ...this.fromInput(input) }).pipe(
      tap((trip) => this.trips.update((list) => [...list, trip])),
    );
  }

  /** PUT /trips/:id */
  update(trip: Trip, input: TripInput) {
    return this.http.put<Trip>(`${URL}/${trip.id}`, { ...trip, ...this.fromInput(input) }).pipe(
      tap((saved) => this.trips.update((list) => list.map((t) => (t.id === saved.id ? saved : t)))),
    );
  }

  /** DELETE /trips/:id */
  remove(id: number) {
    return this.http.delete(`${URL}/${id}`).pipe(tap(() => this.trips.update((list) => list.filter((t) => t.id !== id))));
  }

  /** Monta a viagem a partir da cidade escolhida: a moeda e o continente vêm do país da cidade. */
  private fromInput(input: TripInput) {
    const { city } = input;
    return {
      cityId: city.id,
      cidade: city.nome,
      estado: city.estado,
      pais: city.pais,
      codigoPais: city.codigoPais,
      continente: this.cities.continentOf(city.codigoPais),
      moeda: this.cities.currencyOf(city.codigoPais),
      dataIda: input.dataIda,
      dataVolta: input.dataVolta,
      orcamentoBRL: input.orcamentoBRL,
      observacoes: input.observacoes.trim(),
    };
  }
}
