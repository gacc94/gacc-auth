import { isDevMode } from "@angular/core";
import {
	withDevtools,
	withGlitchTracking,
} from "@angular-architects/ngrx-toolkit";
import type { SignalStoreFeature } from "@ngrx/signals";

/**
 * A SignalStore feature that enables Redux DevTools integration.
 * This wrapper ensures that DevTools are only active in development mode,
 * which is a best practice for performance and security in production.
 *
 * @remarks
 * We have refactored this to use a more reliable and architecturally sound pattern.
 * The previous dynamic import within `onInit` was brittle because it could miss
 * the early initialization state of the store. By returning the feature
 * conditionally, we maintain high performance while ensuring correct registration.
 *
 * @param storeName - The name that will identify this store in the Redux DevTools extension.
 * @returns A SignalStore feature for DevTools connection or a no-op feature in production.
 *
 * @example
 * ```typescript
 * const MyStore = signalStore(
 *   withDevTools('MyStoreName'),
 *   // ... other features
 * );
 * ```
 */
export function withDevTools(storeName: string): SignalStoreFeature {
	const devToolsFeature = withDevtools(storeName, withGlitchTracking());
	return isDevMode() ? devToolsFeature : (store) => store;
}
