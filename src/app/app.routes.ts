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
        path: 'viagens/nova',
        title: 'Nova viagem | Skyfare',
        loadComponent: () => import('./features/trips/trip-form').then((m) => m.TripForm),
      },
      {
        path: 'viagens/:id/editar',
        title: 'Editar viagem | Skyfare',
        loadComponent: () => import('./features/trips/trip-form').then((m) => m.TripForm),
      },
      {
        path: 'viagens/:id',
        title: 'Detalhe da viagem | Skyfare',
        loadComponent: () => import('./features/trips/trip-detail').then((m) => m.TripDetail),
      },
      {
        path: 'dashboard',
        title: 'Dashboard | Skyfare',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'admin/usuarios',
        title: 'Usuários | Skyfare',
        loadComponent: () => import('./features/admin/users').then((m) => m.Users),
      },
      {
        path: 'acesso-negado',
        title: 'Acesso negado | Skyfare',
        loadComponent: () => import('./features/errors/forbidden').then((m) => m.Forbidden),
      },
      {
        path: '**',
        title: 'Página não encontrada | Skyfare',
        loadComponent: () => import('./features/errors/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
