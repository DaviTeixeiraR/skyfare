import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, tap } from 'rxjs';
import { API_URL } from '../api';
import { friendlyError } from '../errors';
import { City, Continente, Country } from '../models';
import { normalizeText } from '../utils/text';

/** Cidades e países (coleções cities e countries da API). */
@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly http = inject(HttpClient);
  private readonly cities = signal<City[]>([]);
  private readonly countries = signal<Country[]>([]);

  /** Busca as cidades e os países na API (GET /cities e GET /countries). */
  load(): Observable<void> {
    return forkJoin({
      cities: this.http.get<City[]>(`${API_URL}/cities`),
      countries: this.http.get<Country[]>(`${API_URL}/countries`),
    }).pipe(
      tap(({ cities, countries }) => {
        this.cities.set(cities);
        this.countries.set(countries);
      }),
      map(() => undefined),
      friendlyError('Não foi possível carregar as cidades.'),
    );
  }

  /** Cidades cujo nome começa com o termo digitado. Exige pelo menos 2 letras. */
  search(term: string, limit = 6): City[] {
    const q = normalizeText(term);
    if (q.length < 2) return [];
    return this.cities().filter((c) => normalizeText(c.nome).startsWith(q)).slice(0, limit);
  }

  getById(id: number): City | undefined {
    return this.cities().find((c) => c.id === id);
  }

  getByName(nome: string): City | undefined {
    const q = normalizeText(nome);
    return this.cities().find((c) => normalizeText(c.nome) === q);
  }

  /** Continente do país da cidade. */
  continentOf(codigoPais: string): Continente {
    return this.country(codigoPais)?.continente ?? 'Europa';
  }

  /** Código da moeda de um país (ex.: GB → GBP). */
  currencyOf(codigoPais: string): string {
    return this.country(codigoPais)?.moeda ?? '';
  }

  private country(codigo: string): Country | undefined {
    return this.countries().find((c) => c.id === codigo);
  }
}
