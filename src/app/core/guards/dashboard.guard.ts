import { inject } from "@angular/core";
import {
	type ActivatedRouteSnapshot,
	type CanActivateFn,
	Router,
	type RouterStateSnapshot,
} from "@angular/router";
import { AuthStore } from "@features/auth/infrastructure/stores/auth.store";

export const dashboardGuard: CanActivateFn = () => {
	const router = inject(Router);
	const authStore = inject(AuthStore);
	console.log("DashboardGuard =======> ", authStore.user());

	if (authStore.user() !== null) {
		return true;
	}

	router.navigate(["/auth"]);
	return false;
};
