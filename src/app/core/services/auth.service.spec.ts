import { TestBed } from '@angular/core/testing';
import { SENHA_DEMO } from '../mock/mock-data';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

describe('AuthService', () => {
  let auth: AuthService;
  let users: UserService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    auth = TestBed.inject(AuthService);
    users = TestBed.inject(UserService);
  });

  it('começa sem sessão', () => {
    expect(auth.user()).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.isAdmin()).toBe(false);
  });

  it('entra com e-mail e senha corretos', () => {
    auth.login('skyfareuser@gmail.com', SENHA_DEMO);
    expect(auth.user()?.nome).toBe('Davi Teixeira');
    expect(auth.isAdmin()).toBe(true);
  });

  it('recusa e-mail ou senha incorretos com a mesma mensagem', () => {
    expect(() => auth.login('skyfareuser@gmail.com', 'errada')).toThrow('E-mail ou senha incorretos');
    expect(() => auth.login('naoexiste@email.com', SENHA_DEMO)).toThrow('E-mail ou senha incorretos');
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('bloqueia conta desativada', () => {
    expect(() => auth.login('diego.m@email.com', SENHA_DEMO)).toThrow('desativada');
  });

  it('cadastra a conta como usuário comum e já entra', () => {
    const user = auth.register({ nome: 'Maria Souza', email: 'maria@email.com', senha: 'senha1234' });
    expect(user.perfil).toBe('usuario');
    expect(auth.user()?.id).toBe(user.id);
    expect(auth.isAdmin()).toBe(false);
  });

  it('acompanha mudanças feitas pelo administrador na conta logada', () => {
    auth.login('ana.souza@email.com', SENHA_DEMO);
    users.setProfile(2, 'admin');
    expect(auth.isAdmin()).toBe(true);
    users.toggleActive(2);
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('sai da conta e limpa a sessão guardada', () => {
    auth.login('skyfareuser@gmail.com', SENHA_DEMO, true);
    expect(localStorage.getItem('skyfare.sessao')).toBe('1');
    auth.logout();
    expect(auth.user()).toBeNull();
    expect(localStorage.getItem('skyfare.sessao')).toBeNull();
  });

  it('sem "manter conectado" a sessão fica só na aba', () => {
    auth.login('skyfareuser@gmail.com', SENHA_DEMO, false);
    expect(localStorage.getItem('skyfare.sessao')).toBeNull();
    expect(sessionStorage.getItem('skyfare.sessao')).toBe('1');
  });
});
