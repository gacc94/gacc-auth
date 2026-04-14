import {
	type EmptyFeatureResult,
	type SignalStoreFeature,
	type SignalStoreFeatureResult,
	signalStoreFeature,
	watchState,
	withHooks,
	withMethods,
} from "@ngrx/signals";

import { withSessionStorage } from "./features/with-session-storage";
import type {
	StorageSyncOptions,
	SyncMethods,
	SyncStorageStrategy,
	SyncStoreForFactory,
} from "./internal/models";
import { normalizeSyncConfigs } from "./internal/utils";

/**
 * A SignalStore feature that synchronizes the store state (or selected slices) with Session Storage or Local Storage.
 *
 * It features "Auto-Discovery" and supports handling multiple properties via an array of configurations.
 * This implementation is explicitly designed for Browser environments where the DOM `window` object is guaranteed.
 *
 * @template Input The incoming state footprint of the SignalStore.
 * @param {StorageSyncOptions<Input["state"]>} options The configuration parameters (single object or array).
 * @param {SyncStorageStrategy<Input["state"]>} [storageStrategy] Optional strategy to handle storage synchronization (defaults to SessionStorage).
 * @returns {SignalStoreFeature} A SignalStore feature injecting hydration and bidirectional persistence methods.
 * 
 * @example
 * ```typescript
 * withStorageSync(
 *   [{ key: 'user', select: state => state.user }],
 *   withLocalStorage()
 * )
 * ```
 */
export function withStorageSync<Input extends SignalStoreFeatureResult>(
	options: StorageSyncOptions<Input["state"]>,
	storageStrategy?: SyncStorageStrategy<Input["state"]>,
): SignalStoreFeature<Input, EmptyFeatureResult & { methods: SyncMethods }> {
	const factory = storageStrategy ?? withSessionStorage<Input["state"]>();

	return signalStoreFeature(
		withMethods((store) => {
			const configs = normalizeSyncConfigs(options);
			return factory(
				configs,
				store as SyncStoreForFactory<Input["state"]>,
			);
		}),
		withHooks({
			onInit(store) {
				const syncMethods = store as unknown as SyncMethods;

				// A. Initial hydration: Read from storage and update the store
				syncMethods.readFromStorage();

				// B. Persistence: Watch for state changes and update the storage
				watchState(store, () => syncMethods.writeToStorage());
			},
		}),
	);
}

// Re-export strategies and models for better consumer DX
export { withLocalStorage } from "./features/with-local-storage";
export { withSessionStorage } from "./features/with-session-storage";
export type * from "./internal/models";
