import { inject } from "@angular/core";
import type { WithStoreDevToolsFeature } from "@envs/models/environment.model";
import { ENVIRONMENT } from "@envs/models/environment.token";

/**
 * A tree-shakable SignalStore feature that enables Redux DevTools integration.
 *
 * @param args - Arguments passed to the DevTools feature (store name and optional features).
 */
export const withDevTools: WithStoreDevToolsFeature = (...args) => {
	return (store) => {
		const env = inject(ENVIRONMENT);
		return env.withStoreDevTools(...args)(store);
	};
};
