import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./presentation/pages/home/home'),
    },
];

export default dashboardRoutes;
