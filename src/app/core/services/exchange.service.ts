import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from '../api';
import { ExchangeRate } from '../models';

/** Cotações em reais da API. */
@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private readonly http = inject(HttpClient);
  private readonly rates = signal<ExchangeRate[]>([]);

  /** GET /rates */
  load() {
    return this.http.get<ExchangeRate[]>(`${API_URL}/rates`).pipe(tap((list) => this.rates.set(list)));
  }

  /** Cotação da moeda em reais, ou null (ex.: o real e moedas sem cotação). */
  getRate(moeda: string) {
    return this.rates().find((r) => r.codigo === moeda) ?? null;
  }

  /** Converte reais para a moeda. Sem cotação, mantém o valor. */
  fromBRL(valor: number, moeda: string) {
    const rate = this.getRate(moeda);
    return rate ? valor / rate.cotacao : valor;
  }
}
