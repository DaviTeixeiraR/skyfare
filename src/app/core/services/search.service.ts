import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { API_URL } from '../api';
import { friendlyError } from '../errors';
import { City, SearchEntry } from '../models';

const URL = `${API_URL}/searches`;

/** Histórico de buscas da tela inicial (coleção searches da API). */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<SearchEntry[]>([]);

  /** Últimas cidades pesquisadas, da mais recente para a mais antiga. */
  readonly recent = computed(() =>
    [...this.state()].sort((a, b) => b.ultimaEm.localeCompare(a.ultimaEm)).slice(0, 5),
  );
  /** Cidades mais pesquisadas (usado no dashboard). */
  readonly top = computed(() => [...this.state()].sort((a, b) => b.buscas - a.buscas).slice(0, 5));

  /** Busca o histórico na API (GET /searches). */
  load(): Observable<void> {
    return this.http.get<SearchEntry[]>(URL).pipe(
      tap((list) => this.state.set(list)),
      map(() => undefined),
      friendlyError('Não foi possível carregar o histórico de buscas.'),
    );
  }

  /** Registra a busca: soma 1 se a cidade já está no histórico (PATCH) ou cria o item (POST). */
  register(city: City): Observable<SearchEntry> {
    const ultimaEm = new Date().toISOString();
    const current = this.state().find((s) => s.cityId === city.id);
    const request = current
      ? this.http.patch<SearchEntry>(`${URL}/${current.id}`, { buscas: current.buscas + 1, ultimaEm })
      : this.http.post<SearchEntry>(URL, { cityId: city.id, cidade: city.nome, pais: city.pais, buscas: 1, ultimaEm });
    return request.pipe(
      tap((saved) =>
        this.state.update((list) =>
          current ? list.map((s) => (s.id === saved.id ? saved : s)) : [...list, saved],
        ),
      ),
      friendlyError('Não foi possível salvar a busca.'),
    );
  }
}
