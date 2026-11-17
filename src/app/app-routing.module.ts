import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

/**
 * Módulo de rotas da aplicação. A lista de rotas fica em app.routes.ts
 * e este módulo a registra no Router (importado em app.config.ts).
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true, scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
