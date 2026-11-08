import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { flushList, login, setupHttp, USERS } from '../testing';
import { adminGuard, authGuard } from './auth.guard';

function run(guard: typeof authGuard, url: string) {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url } as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => guard(route, state));
}

describe('guards de rota', () => {
  let auth: AuthService;
  let router: Router;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    http = setupHttp([provideRouter([])]);
    TestBed.inject(UserService).load().subscribe();
    flushList(http, 'users', USERS);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('authGuard manda quem não entrou para o login guardando a rota pedida', () => {
    const result = run(authGuard, '/viagens/3') as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login?redirectTo=%2Fviagens%2F3');
  });

  it('authGuard libera usuário logado', () => {
    login(auth, http, 'ana.souza@email.com');
    expect(run(authGuard, '/viagens')).toBe(true);
  });

  it('adminGuard leva usuário comum para acesso negado', () => {
    login(auth, http, 'ana.souza@email.com');
    const result = run(adminGuard, '/admin/usuarios') as UrlTree;
    expect(router.serializeUrl(result)).toBe('/acesso-negado');
  });

  it('adminGuard libera administrador e manda visitante para o login', () => {
    expect(router.serializeUrl(run(adminGuard, '/admin/usuarios') as UrlTree)).toContain('/login');
    login(auth, http, 'skyfareuser@gmail.com');
    expect(run(adminGuard, '/admin/usuarios')).toBe(true);
  });
});
