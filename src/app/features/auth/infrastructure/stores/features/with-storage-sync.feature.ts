import {
	type EmptyFeatureResult,
	type SignalStoreFeature,
	type SignalStoreFeatureResult,
	signalStoreFeature,
	watchState,
	withHooks,
	withMethods,
} from "@ngrx/signals";
import { withSessionStorage } from "./storage-sync.strategies";
import type {
	StorageSyncOptions,
	SyncMethods,
	SyncStorageStrategy,
	SyncStoreForFactory,
} from "./storage-sync.types";
import { normalizeSyncConfigs } from "./storage-sync.utils";

/**
 * A SignalStore feature that synchronizes the store state (or selected slices) with Session Storage or Local Storage.
 *
 * It features "Auto-Discovery" and supports handling multiple properties via an array of configurations.
 * It ensures that ONLY the specified properties are patched back on reload, preserving other initial values.
 *
 * @template Input The incoming state footprint of the SignalStore.
 * @param {StorageSyncOptions<Input["state"]>} options The configuration parameters (single object or array).
 * @param {SyncStorageStrategy<Input["state"]>} [storageStrategy] Optional strategy to handle storage synchronization (defaults to SessionStorage).
 * @returns A SignalStore feature injecting hydration and persistence methods.
 *
 * @example
 * ```typescript
 * withStorageSync([
 *   { key: "auth-user", select: (state) => state.user },
 *   { key: "auth-jwt", select: (state) => state.jwt }
 * ], withLocalStorage())
 * ```
 */
export function withStorageSync<Input extends SignalStoreFeatureResult>(
	options: StorageSyncOptions<Input["state"]>,
	storageStrategy?: SyncStorageStrategy<Input["state"]>,
): SignalStoreFeature<Input, EmptyFeatureResult & { methods: SyncMethods }> {
	// 1. Determine the storage strategy factory
	const factory = storageStrategy ?? withSessionStorage<Input["state"]>();

	return signalStoreFeature(
		withMethods((store) => {
			const configs = normalizeSyncConfigs(options);

			// 2. Delegate the strategy the responsibility of providing read/write operations
			return factory(configs, store as SyncStoreForFactory<Input["state"]>);
		}),
		withHooks({
			onInit(store) {
				// We cast to SyncMethods because they were added by the previous feature wrapper
				const syncMethods = store as SyncMethods;

				// A. Initial hydration: Read from storage and update the store
				syncMethods.readFromStorage();

				// B. Persistence: Watch for state changes and update the storage
				watchState(store, () => syncMethods.writeToStorage());
			},
		}),
	);
}

// Re-export types and strategies for better consumer DX
export * from "./storage-sync.strategies";
export * from "./storage-sync.types";
