import { inject, type Type } from "@angular/core";
import { getState, patchState } from "@ngrx/signals";
import type {
	NormalizedSyncConfig,
	SyncMethods,
	SyncStorageStrategy,
	SyncStoreForFactory,
} from "./models";
import type { StorageProvider } from "./storage.service";
import {
	clearStorageProvider,
	persistStateToStorage,
	readValueFromStorage,
	removeValueFromStorage,
	resolveHydrationPatch,
} from "./utils";

/**
 * Creates a generic storage synchronization strategy adopting the abstract factory pattern.
 * Provides the shared core logic (DRY principle) for reading and writing data safely
 * across different browser storage mediums.
 *
 * @template State The shape of the store's state being synchronized.
 * @param {Type<StorageProvider>} StorageServiceToken - The explicit storage provider token to be resolved via Dependency Injection.
 * @returns {SyncStorageStrategy<State>} A robust synchronization strategy ready to be consumed by NgRx Signals.
 */
export function createStorageStrategy<State extends object>(
	StorageServiceToken: Type<StorageProvider>,
): SyncStorageStrategy<State> {
	return function factory(
		configs: NormalizedSyncConfig<State>[],
		store: SyncStoreForFactory<State>,
	): SyncMethods {
		// Inject the requested native storage provider dynamically (e.g., LocalStorageService)
		const storage = inject(StorageServiceToken);

		// Capture the initial state synchronously at the time of feature creation
		// before any hydration or state mutations occur.
		const initialState = getState(store);

		return {
			/**
			 * Reads data from storage resolving all configuration metadata.
			 * Extracts the hydration mapping into a pure functional reducer.
			 */
			readFromStorage(): void {
				const combinedPatch = configs.reduce(
					(accumulated, config) => {
						const rawData = readValueFromStorage(
							storage,
							config.key,
							config.parse,
						);
						if (rawData === null) return accumulated;

						const patch = resolveHydrationPatch(config, rawData);
						if (patch !== null) {
							Object.assign(accumulated, patch);
							return accumulated;
						}

						console.warn(
							`[withStorageSync] Key '${config.key}' was retrieved but no routing mapping or rehydrate logic found.`,
						);
						return accumulated;
					},
					{} as Partial<State>,
				);

				if (Object.keys(combinedPatch).length > 0) {
					patchState(store, combinedPatch);
				}
			},

			/**
			 * Persists the configured slices into storage.
			 */
			writeToStorage(): void {
				persistStateToStorage(configs, storage, getState(store) as State);
			},

			/**
			 * Removes only the specifically configured synchronization keys from the storage.
			 */
			removeFromStorage(): void {
				for (const config of configs) {
					removeValueFromStorage(storage, config.key);
				}
			},

			/**
			 * Completely clears all data from the active storage provider.
			 */
			clearStorage(): void {
				clearStorageProvider(storage);
			},

			/**
			 * Resets the storage keys to their initial state values as defined by the store.
			 * It also reverts the state in memory back to these initial defaults.
			 */
			resetToStorage(): void {
				patchState(store, initialState as Partial<State>);
				persistStateToStorage(configs, storage, initialState as State);
			},
		};
	};
}
