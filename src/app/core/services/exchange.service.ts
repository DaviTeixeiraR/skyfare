import { Injectable } from '@angular/core';
import { COTACOES, MOEDA_POR_PAIS } from '../mock/mock-data';
import { ExchangeRate } from '../models';

/** Moeda dos países e cotação em reais (na etapa das APIs: REST Countries + AwesomeAPI). */
@Injectable({ providedIn: 'root' })
export class ExchangeService {
  /** Código da moeda de um país (ex.: GB → GBP). */
  currencyOf(codigoPais: string): string {
    return MOEDA_POR_PAIS[codigoPais] ?? '';
  }

  /** Cotação da moeda em reais. Devolve null para o real e para moedas sem cotação. */
  getRate(codigoMoeda: string): ExchangeRate | null {
    return COTACOES[codigoMoeda] ?? null;
  }

  /** Converte um valor em reais para a moeda informada. Sem cotação, mantém o valor. */
  fromBRL(valor: number, codigoMoeda: string): number {
    const rate = this.getRate(codigoMoeda);
    return rate ? valor / rate.cotacao : valor;
  }
}
