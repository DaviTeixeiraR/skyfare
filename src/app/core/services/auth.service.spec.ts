import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api';
import { flushList, login, SENHA, setupHttp, USERS } from '../testing';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    http = setupHttp();
    TestBed.inject(UserService).load().subscribe();
    flushList(http, 'users', USERS);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => http.verify());

  it('começa sem sessão', () => {
    expect(auth.user()).toBeNull();
    expect(auth.isAdmin()).toBe(false);
  });

  it('entra com e-mail e senha corretos', () => {
    expect(login(auth, http, 'skyfareuser@gmail.com')).toBe('');
    expect(auth.user()?.nome).toBe('Davi Teixeira');
    expect(auth.isAdmin()).toBe(true);
  });

  it('recusa e-mail ou senha incorretos com a mesma mensagem', () => {
    expect(login(auth, http, 'skyfareuser@gmail.com', 'errada')).toContain('E-mail ou senha incorretos');
    expect(login(auth, http, 'naoexiste@email.com')).toContain('E-mail ou senha incorretos');
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('bloqueia conta desativada', () => {
    expect(login(auth, http, 'diego.m@email.com')).toContain('desativada');
  });

  it('cadastra a conta como usuário comum e já entra', () => {
    auth.register({ nome: 'Maria Souza', email: 'maria@email.com', senha: 'senha1234' }).subscribe();
    http.expectOne((r) => r.params.get('email') === 'maria@email.com').flush([]);
    const post = http.expectOne({ method: 'POST', url: `${API_URL}/users` });
    post.flush({ ...post.request.body, id: 9 });
    expect(auth.user()?.id).toBe(9);
    expect(auth.isAdmin()).toBe(false);
  });

  it('sai da conta e limpa a sessão guardada', () => {
    login(auth, http, 'skyfareuser@gmail.com');
    expect(localStorage.getItem('skyfare.sessao')).toBe('1');
    auth.logout();
    expect(auth.user()).toBeNull();
    expect(localStorage.getItem('skyfare.sessao')).toBeNull();
  });

  it('sem "manter conectado" a sessão fica só na aba', () => {
    login(auth, http, 'skyfareuser@gmail.com', SENHA, false);
    expect(localStorage.getItem('skyfare.sessao')).toBeNull();
    expect(sessionStorage.getItem('skyfare.sessao')).toBe('1');
  });
});
