import { inject } from "@angular/core";
import {
	type ActivatedRouteSnapshot,
	type CanActivateFn,
	Router,
	type RouterStateSnapshot,
} from "@angular/router";
import { AuthStore } from "@features/auth/infrastructure/stores/auth.store";

export const authGuard: CanActivateFn = () => {
	const router = inject(Router);
	const authStore = inject(AuthStore);

	console.log("AuthGuard =======> ", authStore.user());
	if (authStore.user() === null) {
		return true;
	}

	router.navigate(["/dashboard"]);
	return false;
};
