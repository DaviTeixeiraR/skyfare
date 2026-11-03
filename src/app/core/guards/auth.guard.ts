import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Telas internas: sem login, vai para /login e volta para a tela pedida depois de entrar. */
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return (
    inject(AuthService).isLoggedIn() ||
    router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } })
  );
};

/** Área do administrador: logado sem o perfil admin cai em /acesso-negado. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
  }
  return auth.isAdmin() || router.createUrlTree(['/acesso-negado']);
};
