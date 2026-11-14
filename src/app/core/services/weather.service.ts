import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from '../api';
import { CityWeather } from '../models';

/** Clima atual e previsão de 7 dias de cada cidade (coleção weather da API). */
@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly list = signal<CityWeather[]>([]);

  /** GET /weather */
  load() {
    return this.http.get<CityWeather[]>(`${API_URL}/weather`).pipe(tap((list) => this.list.set(list)));
  }

  /** O db.json tem o clima de todas as cidades (o id do clima é o id da cidade). */
  getByCity(cityId: number) {
    return this.list().find((w) => w.id === cityId)!;
  }
}
