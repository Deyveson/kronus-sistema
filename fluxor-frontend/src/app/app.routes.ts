import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AgendamentoPublico } from './pages/agendamento-publico/agendamento-publico';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'agendamento-online',
        component: AgendamentoPublico
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [authGuard]
    },
    {
        path: 'agenda',
        loadComponent: () => import('./pages/agenda/agenda').then(m => m.Agenda),
        canActivate: [authGuard]
    },
    {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes').then(m => m.Clientes),
        canActivate: [authGuard]
    },
    {
        path: 'profissionais',
        loadComponent: () => import('./pages/profissionais/profissionais').then(m => m.Profissionais),
        canActivate: [authGuard]
    },
    {
        path: 'servicos',
        loadComponent: () => import('./pages/servicos/servicos').then(m => m.Servicos),
        canActivate: [authGuard]
    },
    {
        path: 'lista-espera',
        loadComponent: () => import('./pages/lista-espera/lista-espera').then(m => m.ListaEspera),
        canActivate: [authGuard]
    },
    {
        path: 'relatorios',
        loadComponent: () => import('./pages/relatorios/relatorios').then(m => m.Relatorios),
        canActivate: [authGuard]
    },
    {
        path: 'teste',
        loadComponent: () => import('./pages/teste/teste').then(m => m.Teste),
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
