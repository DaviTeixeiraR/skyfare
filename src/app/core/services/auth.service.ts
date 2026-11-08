import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { BusinessError } from '../errors';
import { NewUser, User } from '../models';
import { UserService } from './user.service';

const SESSION_KEY = 'skyfare.sessao';

/** Sessão do usuário: login e cadastro de conta consultam a API pelo UserService. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = inject(UserService);
  private readonly userId = signal<number | null>(this.restoreSession());

  /**
   * Usuário logado. Sai da lista do UserService, então mudanças feitas pelo
   * administrador (perfil, conta desativada ou excluída) valem na hora.
   */
  readonly user = computed<User | null>(() => {
    const id = this.userId();
    const user = id === null ? null : this.users.getById(id);
    return user?.ativo ? user : null;
  });
  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.perfil === 'admin');

  /** Procura o e-mail na API (GET /users?email=) e confere a senha. */
  login(email: string, senha: string, lembrar = true): Observable<User> {
    return this.users.fetchByEmail(email).pipe(
      map((user) => {
        if (!user || user.senha !== senha) throw new BusinessError('E-mail ou senha incorretos.');
        if (!user.ativo) throw new BusinessError('Esta conta está desativada. Fale com um administrador.');
        return user;
      }),
      tap((user) => {
        this.users.upsert(user);
        this.userId.set(user.id);
        this.saveSession(user.id, lembrar);
      }),
    );
  }

  /** Cria a conta (perfil usuário) pela API e já entra com ela. */
  register(data: Omit<NewUser, 'perfil'>): Observable<User> {
    return this.users.create({ ...data, perfil: 'usuario' }).pipe(
      tap((user) => {
        this.userId.set(user.id);
        this.saveSession(user.id, true);
      }),
    );
  }

  logout(): void {
    this.userId.set(null);
    this.storages().forEach((s) => s.removeItem(SESSION_KEY));
  }

  /** O navegador pode bloquear o storage (modo privado), por isso tudo passa por try/catch. */
  private storages(): Storage[] {
    try {
      return [localStorage, sessionStorage];
    } catch {
      return [];
    }
  }

  private saveSession(id: number, lembrar: boolean) {
    const [local, session] = this.storages();
    try {
      this.storages().forEach((s) => s.removeItem(SESSION_KEY));
      (lembrar ? local : session)?.setItem(SESSION_KEY, String(id));
    } catch {
      /* sem storage a sessão vale só até recarregar a página */
    }
  }

  private restoreSession(): number | null {
    for (const storage of this.storages()) {
      try {
        const id = Number(storage.getItem(SESSION_KEY));
        if (id) return id;
      } catch {
        /* ignora */
      }
    }
    return null;
  }
}
