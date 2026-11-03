import { computed, inject, Injectable, signal } from '@angular/core';
import { BusinessError } from '../errors';
import { NewUser, User } from '../models';
import { UserService } from './user.service';

const SESSION_KEY = 'skyfare.sessao';

/** Sessão do usuário: login, cadastro de conta e logout (simulados, sem API). */
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

  login(email: string, senha: string, lembrar = true): User {
    const user = this.users.findByEmail(email);
    if (!user || user.senha !== senha) throw new BusinessError('E-mail ou senha incorretos.');
    if (!user.ativo) throw new BusinessError('Esta conta está desativada. Fale com um administrador.');
    this.userId.set(user.id);
    this.saveSession(user.id, lembrar);
    return user;
  }

  /** Cria a conta (perfil usuário) e já entra com ela. */
  register(data: Omit<NewUser, 'perfil'>): User {
    const user = this.users.create({ ...data, perfil: 'usuario' });
    this.userId.set(user.id);
    this.saveSession(user.id, true);
    return user;
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
