import { Routes } from '@angular/router';
import SignIn from './presentation/sign-in/sign-in';
import { authGuard } from '@core/guards/auth.guard';

export default <Routes>[
    {
        path: 'sign-in',
        component: SignIn,
        canActivate: [authGuard],
    },
    {
        path: '**',
        redirectTo: 'sign-in',
    },
];
