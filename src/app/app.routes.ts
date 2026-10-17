import { Routes } from '@angular/router';
import { AuthLayout } from './layout/auth-layout';
import { MainLayout } from './layout/main-layout';

// Cada tela é carregada sob demanda (lazy loading) com loadComponent.
// Os guards de autenticação e de perfil entram na etapa de desenvolvimento.
export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayout,
    children: [
      {
        path: '',
        title: 'Entrar | Skyfare',
        loadComponent: () => import('./features/auth/login').then((m) => m.Login),
      },
    ],
  },
  {
    path: 'cadastro',
    component: AuthLayout,
    children: [
      {
        path: '',
        title: 'Criar conta | Skyfare',
        loadComponent: () => import('./features/auth/register').then((m) => m.Register),
      },
    ],
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Skyfare',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'viagens',
        title: 'Minhas viagens | Skyfare',
        loadComponent: () => import('./features/trips/trip-list').then((m) => m.TripList),
      },
      {
        path: 'viagens/:id',
        title: 'Detalhe da viagem | Skyfare',
        loadComponent: () => import('./features/trips/trip-detail').then((m) => m.TripDetail),
      },
    ],
  },
];
