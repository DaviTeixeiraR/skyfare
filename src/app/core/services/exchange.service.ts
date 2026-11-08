import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { API_URL } from '../api';
import { friendlyError } from '../errors';
import { ExchangeRate } from '../models';
import { CityService } from './city.service';

/** Moeda dos países e cotação em reais (coleção rates da API). */
@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private readonly http = inject(HttpClient);
  private readonly cities = inject(CityService);
  private readonly rates = signal<ExchangeRate[]>([]);

  /** Busca as cotações na API (GET /rates). */
  load(): Observable<void> {
    return this.http.get<ExchangeRate[]>(`${API_URL}/rates`).pipe(
      tap((list) => this.rates.set(list)),
      map(() => undefined),
      friendlyError('Não foi possível carregar as cotações.'),
    );
  }

  /** Código da moeda de um país (ex.: GB → GBP). */
  currencyOf(codigoPais: string): string {
    return this.cities.currencyOf(codigoPais);
  }

  /** Cotação da moeda em reais. Devolve null para o real e para moedas sem cotação. */
  getRate(codigoMoeda: string): ExchangeRate | null {
    return this.rates().find((r) => r.codigo === codigoMoeda) ?? null;
  }

  /** Converte um valor em reais para a moeda informada. Sem cotação, mantém o valor. */
  fromBRL(valor: number, codigoMoeda: string): number {
    const rate = this.getRate(codigoMoeda);
    return rate ? valor / rate.cotacao : valor;
  }
}
