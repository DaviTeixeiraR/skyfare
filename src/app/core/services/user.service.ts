import { computed, Injectable, signal } from '@angular/core';
import { BusinessError } from '../errors';
import { HOJE, USUARIOS } from '../mock/mock-data';
import { NewUser, Perfil, User } from '../models';
import { normalizeText } from '../utils/text';
import { toIsoDate } from '../utils/trip-utils';

export type UserProfileFilter = 'todos' | Perfil;

/** Cadastro, consulta, edição e exclusão de usuários (lista em memória, sem API). */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly state = signal<User[]>(USUARIOS.map((u) => ({ ...u })));

  readonly users = this.state.asReadonly();
  readonly total = computed(() => this.state().length);
  readonly activeCount = computed(() => this.state().filter((u) => u.ativo).length);
  readonly adminCount = computed(() => this.state().filter((u) => u.perfil === 'admin').length);

  getById(id: number): User | undefined {
    return this.state().find((u) => u.id === id);
  }

  findByEmail(email: string): User | undefined {
    const e = normalizeText(email);
    return this.state().find((u) => normalizeText(u.email) === e);
  }

  /** Pesquisa por nome ou e-mail, com filtro opcional de perfil. */
  search(texto: string, perfil: UserProfileFilter = 'todos'): User[] {
    const q = normalizeText(texto);
    return this.state()
      .filter((u) => perfil === 'todos' || u.perfil === perfil)
      .filter((u) => !q || normalizeText(`${u.nome} ${u.email}`).includes(q));
  }

  create(data: NewUser): User {
    const nome = data.nome.trim();
    const email = data.email.trim();
    if (nome.length < 3) throw new BusinessError('Informe o nome com pelo menos 3 letras.');
    if (data.senha.length < 8) throw new BusinessError('A senha precisa ter pelo menos 8 caracteres.');
    if (this.findByEmail(email)) throw new BusinessError('Já existe uma conta com este e-mail.');

    const user: User = {
      id: Math.max(0, ...this.state().map((u) => u.id)) + 1,
      nome,
      email,
      perfil: data.perfil ?? 'usuario',
      ativo: true,
      criadoEm: toIsoDate(HOJE),
      senha: data.senha,
    };
    this.state.update((list) => [...list, user]);
    return user;
  }

  update(id: number, changes: Partial<Pick<User, 'nome' | 'email' | 'perfil' | 'ativo'>>): User {
    const current = this.getById(id);
    if (!current) throw new BusinessError('Usuário não encontrado.');
    if (changes.email && normalizeText(changes.email) !== normalizeText(current.email)) {
      if (this.findByEmail(changes.email)) throw new BusinessError('Já existe uma conta com este e-mail.');
    }
    const updated = { ...current, ...changes };
    this.state.update((list) => list.map((u) => (u.id === id ? updated : u)));
    return updated;
  }

  setProfile(id: number, perfil: Perfil): User {
    return this.update(id, { perfil });
  }

  /** Ativa ou desativa a conta. */
  toggleActive(id: number): User {
    const user = this.getById(id);
    if (!user) throw new BusinessError('Usuário não encontrado.');
    return this.update(id, { ativo: !user.ativo });
  }

  remove(id: number): void {
    if (!this.getById(id)) throw new BusinessError('Usuário não encontrado.');
    this.state.update((list) => list.filter((u) => u.id !== id));
  }
}
