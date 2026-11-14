import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { User } from '../models';
import { UserService } from './user.service';

/** Usuário logado: só o que o menu e as telas precisam. */
export type Sessao = Pick<User, 'id' | 'nome' | 'email' | 'perfil'>;

/** Contas fixas no código (login simples, sem consultar a API). */
const CONTAS = [
  { email: 'skyfareuser@gmail.com', senha: 'skyfare123', usuario: { id: 1, nome: 'Davi Teixeira', email: 'skyfareuser@gmail.com', perfil: 'admin' } },
  { email: 'ana.souza@email.com', senha: 'skyfare123', usuario: { id: 2, nome: 'Ana Carolina Souza', email: 'ana.souza@email.com', perfil: 'usuario' } },
] as const;

const CHAVE = 'skyfare.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = inject(UserService);

  /** Usuário logado (null se ninguém entrou). Fica guardado no navegador para valer depois de recarregar. */
  readonly user = signal<Sessao | null>(JSON.parse(localStorage.getItem(CHAVE) ?? 'null'));
  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.perfil === 'admin');

  /** Confere e-mail e senha com as contas fixas. Devolve true se entrou. */
  login(email: string, senha: string) {
    const conta = CONTAS.find((c) => c.email === email && c.senha === senha);
    if (conta) this.entrar({ ...conta.usuario });
    return !!conta;
  }

  /** Cria a conta na API (perfil usuário) e já entra com ela. */
  register(nome: string, email: string) {
    return this.users.create(nome, email).pipe(tap((u) => this.entrar({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil })));
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem(CHAVE);
  }

  private entrar(sessao: Sessao) {
    this.user.set(sessao);
    localStorage.setItem(CHAVE, JSON.stringify(sessao));
  }
}
