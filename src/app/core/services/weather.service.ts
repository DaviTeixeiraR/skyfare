import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { API_URL } from '../api';
import { friendlyError } from '../errors';
import { CityWeather, Weather } from '../models';

/** Clima genérico usado quando a cidade não tem dados de clima. */
const SEM_DADOS: Weather = {
  atual: { temperatura: 0, sensacao: 0, umidade: 0, vento: 0, codigo: 0, maxima: 0, minima: 0 },
  diario: [],
};

/** Clima atual e previsão de 7 dias (coleção weather da API). */
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly list = signal<CityWeather[]>([]);

  /** Busca o clima das cidades na API (GET /weather). */
  load(): Observable<void> {
    return this.http.get<CityWeather[]>(`${API_URL}/weather`).pipe(
      tap((list) => this.list.set(list)),
      map(() => undefined),
      friendlyError('Não foi possível carregar o clima.'),
    );
  }

  /** Cidades sem dados próprios recebem um clima genérico (o de Lisboa, id 2267057). */
  getByCity(cityId: number): Weather {
    const all = this.list();
    return all.find((w) => w.id === cityId) ?? all.find((w) => w.id === 2267057) ?? all[0] ?? SEM_DADOS;
  }
}
