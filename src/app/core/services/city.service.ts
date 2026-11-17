import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, tap } from 'rxjs';
import { API_URL } from '../api';
import { City, Continente, Country } from '../models';
import { normalizeText } from '../utils/text';

/** Cidades e países da API (a moeda e o continente de cada cidade vêm do país). */
@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly http = inject(HttpClient);
  private readonly cities = signal<City[]>([]);
  private readonly countries = signal<Country[]>([]);

  /** GET /cities e GET /countries */
  load() {
    return forkJoin([this.http.get<City[]>(`${API_URL}/cities`), this.http.get<Country[]>(`${API_URL}/countries`)]).pipe(
      tap(([cities, countries]) => {
        this.cities.set(cities);
        this.countries.set(countries);
      }),
    );
  }

  /** Cidades cujo nome começa com o texto digitado (a partir de 2 letras). */
  search(texto: string, limite = 6) {
    const q = normalizeText(texto);
    if (q.length < 2) return [];
    return this.cities().filter((c) => normalizeText(c.nome).startsWith(q)).slice(0, limite);
  }

  getById(id: number) {
    return this.cities().find((c) => c.id === id);
  }

  getByName(nome: string) {
    return this.cities().find((c) => c.nome === nome);
  }

  currencyOf(codigoPais: string) {
    return this.countries().find((c) => c.id === codigoPais)?.moeda ?? 'BRL';
  }

  continentOf(codigoPais: string): Continente {
    return this.countries().find((c) => c.id === codigoPais)?.continente ?? 'Europa';
  }
}
