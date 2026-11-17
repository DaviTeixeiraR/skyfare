import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { API_URL } from '../api';
import { Perfil, User } from '../models';
import { normalizeText } from '../utils/text';

const URL = `${API_URL}/users`;

/** Usuários na API: listar, pesquisar, cadastrar, alterar e excluir. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  readonly users = signal<User[]>([]);
  readonly activeCount = computed(() => this.users().filter((u) => u.ativo).length);
  readonly adminCount = computed(() => this.users().filter((u) => u.perfil === 'admin').length);

  /** GET /users */
  load() {
    return this.http.get<User[]>(URL).pipe(tap((list) => this.users.set(list)));
  }

  /** Pesquisa por nome ou e-mail, com filtro de perfil ('todos' mostra todos). */
  search(texto: string, perfil: Perfil | 'todos') {
    const q = normalizeText(texto);
    return this.users().filter(
      (u) => (perfil === 'todos' || u.perfil === perfil) && normalizeText(`${u.nome} ${u.email}`).includes(q),
    );
  }

  emailExists(email: string) {
    return this.users().some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  /** POST /users */
  create(nome: string, email: string) {
    const user = { nome, email: email.trim().toLowerCase(), perfil: 'usuario', ativo: true, criadoEm: new Date().toISOString().slice(0, 10) };
    return this.http.post<User>(URL, user).pipe(tap((saved) => this.users.update((list) => [...list, saved])));
  }

  /** PATCH /users/:id */
  update(id: number, changes: Partial<User>) {
    return this.http.patch<User>(`${URL}/${id}`, changes).pipe(
      tap((saved) => this.users.update((list) => list.map((u) => (u.id === id ? saved : u)))),
    );
  }

  /** DELETE /users/:id (o JSON-Server apaga também as viagens do usuário) */
  remove(id: number) {
    return this.http.delete(`${URL}/${id}`).pipe(tap(() => this.users.update((list) => list.filter((u) => u.id !== id))));
  }
}
