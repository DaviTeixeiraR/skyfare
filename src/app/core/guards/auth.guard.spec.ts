import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SENHA_DEMO } from '../mock/mock-data';
import { AuthService } from '../services/auth.service';
import { adminGuard, authGuard } from './auth.guard';

function run(guard: typeof authGuard, url: string) {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url } as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => guard(route, state));
}

describe('guards de rota', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('authGuard manda quem não entrou para o login guardando a rota pedida', () => {
    const result = run(authGuard, '/viagens/3') as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login?redirectTo=%2Fviagens%2F3');
  });

  it('authGuard libera usuário logado', () => {
    auth.login('ana.souza@email.com', SENHA_DEMO);
    expect(run(authGuard, '/viagens')).toBe(true);
  });

  it('adminGuard leva usuário comum para acesso negado', () => {
    auth.login('ana.souza@email.com', SENHA_DEMO);
    const result = run(adminGuard, '/admin/usuarios') as UrlTree;
    expect(router.serializeUrl(result)).toBe('/acesso-negado');
  });

  it('adminGuard libera administrador e manda visitante para o login', () => {
    expect(router.serializeUrl(run(adminGuard, '/admin/usuarios') as UrlTree)).toContain('/login');
    auth.login('skyfareuser@gmail.com', SENHA_DEMO);
    expect(run(adminGuard, '/admin/usuarios')).toBe(true);
  });
});
