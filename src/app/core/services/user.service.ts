import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, switchMap, tap, throwError } from 'rxjs';
import { API_URL } from '../api';
import { BusinessError, friendlyError } from '../errors';
import { NewUser, Perfil, User } from '../models';
import { normalizeText } from '../utils/text';
import { toIsoDate } from '../utils/trip-utils';

export type UserProfileFilter = 'todos' | Perfil;

const URL = `${API_URL}/users`;

/** Cadastro, consulta, edição e exclusão de usuários pela API (coleção users). */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<User[]>([]);

  readonly users = this.state.asReadonly();
  readonly total = computed(() => this.state().length);
  readonly activeCount = computed(() => this.state().filter((u) => u.ativo).length);
  readonly adminCount = computed(() => this.state().filter((u) => u.perfil === 'admin').length);

  /** Busca todos os usuários na API (GET /users). */
  load(): Observable<void> {
    return this.http.get<User[]>(URL).pipe(
      tap((list) => this.state.set(list)),
      map(() => undefined),
      friendlyError('Não foi possível carregar os usuários.'),
    );
  }

  getById(id: number): User | undefined {
    return this.state().find((u) => u.id === id);
  }

  /** Consulta a API pelo e-mail (GET /users?email=). Os e-mails são salvos em minúsculas. */
  fetchByEmail(email: string): Observable<User | undefined> {
    return this.http
      .get<User[]>(URL, { params: { email: email.trim().toLowerCase() } })
      .pipe(map((list) => list[0]), friendlyError('Não foi possível consultar o e-mail.'));
  }

  /** Pesquisa por nome ou e-mail, com filtro opcional de perfil. */
  search(texto: string, perfil: UserProfileFilter = 'todos'): User[] {
    const q = normalizeText(texto);
    return this.state()
      .filter((u) => perfil === 'todos' || u.perfil === perfil)
      .filter((u) => !q || normalizeText(`${u.nome} ${u.email}`).includes(q));
  }

  /** Regras do cadastro: nome com 3 letras, senha com 8 caracteres e e-mail único (POST /users). */
  create(data: NewUser): Observable<User> {
    const nome = data.nome.trim();
    const email = data.email.trim().toLowerCase();
    if (nome.length < 3) return throwError(() => new BusinessError('Informe o nome com pelo menos 3 letras.'));
    if (data.senha.length < 8) return throwError(() => new BusinessError('A senha precisa ter pelo menos 8 caracteres.'));

    return this.fetchByEmail(email).pipe(
      switchMap((existing) => {
        if (existing) throw new BusinessError('Já existe uma conta com este e-mail.');
        const novo: Omit<User, 'id'> = {
          nome,
          email,
          perfil: data.perfil ?? 'usuario',
          ativo: true,
          criadoEm: toIsoDate(new Date()),
          senha: data.senha,
        };
        return this.http.post<User>(URL, novo);
      }),
      tap((user) => this.upsert(user)),
      friendlyError('Não foi possível cadastrar o usuário.'),
    );
  }

  /** Altera dados da conta (PATCH /users/:id). */
  update(id: number, changes: Partial<Pick<User, 'nome' | 'perfil' | 'ativo'>>): Observable<User> {
    if (!this.getById(id)) return throwError(() => new BusinessError('Usuário não encontrado.'));
    return this.http.patch<User>(`${URL}/${id}`, changes).pipe(
      tap((user) => this.upsert(user)),
      friendlyError('Não foi possível salvar as alterações do usuário.'),
    );
  }

  setProfile(id: number, perfil: Perfil): Observable<User> {
    return this.update(id, { perfil });
  }

  /** Ativa ou desativa a conta. */
  toggleActive(id: number): Observable<User> {
    const user = this.getById(id);
    if (!user) return throwError(() => new BusinessError('Usuário não encontrado.'));
    return this.update(id, { ativo: !user.ativo });
  }

  /** Exclui a conta (DELETE /users/:id). O JSON-Server também apaga as viagens do usuário. */
  remove(id: number): Observable<void> {
    if (!this.getById(id)) return throwError(() => new BusinessError('Usuário não encontrado.'));
    return this.http.delete<void>(`${URL}/${id}`).pipe(
      tap(() => this.state.update((list) => list.filter((u) => u.id !== id))),
      friendlyError('Não foi possível excluir o usuário.'),
    );
  }

  /** Atualiza (ou acrescenta) o usuário na lista guardada no service. */
  upsert(user: User): void {
    this.state.update((list) =>
      list.some((u) => u.id === user.id) ? list.map((u) => (u.id === user.id ? user : u)) : [...list, user],
    );
  }
}
