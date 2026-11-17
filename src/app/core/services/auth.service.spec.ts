import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { adminGuard, authGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';

describe('AuthService e guards', () => {
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    auth = TestBed.inject(AuthService);
  });

  const rodar = (guard: typeof authGuard) => TestBed.runInInjectionContext(() => guard({} as never, {} as never));
  const rota = (resultado: unknown) => TestBed.inject(Router).serializeUrl(resultado as never);

  it('entra com a conta fixa do administrador e guarda no navegador', () => {
    expect(auth.login('skyfareuser@gmail.com', 'skyfare123')).toBe(true);
    expect(auth.isAdmin()).toBe(true);
    expect(localStorage.getItem('skyfare.usuario')).toContain('Davi Teixeira');
  });

  it('recusa e-mail ou senha errados e sai da conta', () => {
    expect(auth.login('skyfareuser@gmail.com', 'errada')).toBe(false);
    expect(auth.isLoggedIn()).toBe(false);

    auth.login('ana.souza@email.com', 'skyfare123');
    expect(auth.isAdmin()).toBe(false);
    auth.logout();
    expect(auth.user()).toBeNull();
    expect(localStorage.getItem('skyfare.usuario')).toBeNull();
  });

  it('os guards mandam o visitante para o login e o usuário comum para o acesso negado', () => {
    expect(rota(rodar(authGuard))).toBe('/login');
    auth.login('ana.souza@email.com', 'skyfare123');
    expect(rodar(authGuard)).toBe(true);
    expect(rota(rodar(adminGuard))).toBe('/acesso-negado');
    auth.login('skyfareuser@gmail.com', 'skyfare123');
    expect(rodar(adminGuard)).toBe(true);
  });
});
