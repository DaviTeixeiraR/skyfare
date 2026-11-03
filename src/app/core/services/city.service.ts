import { Injectable } from '@angular/core';
import { CIDADES, CONTINENTE_POR_PAIS } from '../mock/mock-data';
import { City, Continente } from '../models';
import { normalizeText } from '../utils/text';

/** Consulta de cidades (autocomplete da busca e escolha do destino da viagem). */
@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly cities: readonly City[] = CIDADES;

  /** Cidades cujo nome começa com o termo digitado. Exige pelo menos 2 letras. */
  search(term: string, limit = 6): City[] {
    const q = normalizeText(term);
    if (q.length < 2) return [];
    return this.cities.filter((c) => normalizeText(c.nome).startsWith(q)).slice(0, limit);
  }

  getById(id: number): City | undefined {
    return this.cities.find((c) => c.id === id);
  }

  getByName(nome: string): City | undefined {
    const q = normalizeText(nome);
    return this.cities.find((c) => normalizeText(c.nome) === q);
  }

  /** Continente do país da cidade (na etapa das APIs vem da REST Countries). */
  continentOf(codigoPais: string): Continente {
    return CONTINENTE_POR_PAIS[codigoPais] ?? 'Europa';
  }
}
