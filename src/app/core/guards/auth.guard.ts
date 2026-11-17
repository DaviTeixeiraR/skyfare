import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Telas de quem entrou: sem login, vai para /login. */
export const authGuard: CanActivateFn = () => {
  return inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/login']);
};

/** Área do administrador: quem não é admin vai para /acesso-negado. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isLoggedIn()) return inject(Router).createUrlTree(['/login']);
  return auth.isAdmin() || inject(Router).createUrlTree(['/acesso-negado']);
};
