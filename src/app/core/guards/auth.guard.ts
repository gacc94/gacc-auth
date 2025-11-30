import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthStore } from '@features/auth/infrastructure/stores/auth.store';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router = inject(Router);
    const authStore = inject(AuthStore);

    if (authStore.user() === null) {
        return true;
    }

    router.navigate(['/dashboard']);
    return false;
};
