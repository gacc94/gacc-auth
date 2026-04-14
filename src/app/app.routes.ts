import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { dashboardGuard } from '@core/guards/dashboard.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes'),
        canActivate: [authGuard],
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes'),
        canActivate: [dashboardGuard],
    },
    {
        path: '**',
        redirectTo: 'auth',
    },
];
