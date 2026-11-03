import { Injectable } from '@angular/core';
import { CLIMA, CLIMA_PADRAO } from '../mock/mock-data';
import { Weather } from '../models';

/** Clima atual e previsão de 7 dias (na etapa das APIs: Open-Meteo Forecast). */
@Injectable({ providedIn: 'root' })
export class WeatherService {
  /** Cidades sem dados fictícios recebem um clima genérico. */
  getByCity(cityId: number): Weather {
    return CLIMA[cityId] ?? CLIMA_PADRAO;
  }
}
