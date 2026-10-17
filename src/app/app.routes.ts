import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout';

// Cada tela é carregada sob demanda (lazy loading) com loadComponent.
// Os guards de autenticação e de perfil entram na etapa de desenvolvimento.
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [],
  },
];
