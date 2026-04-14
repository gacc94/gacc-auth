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
	readValueFromStorage,
	removeValueFromStorage,
	writeValueToStorage,
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

		return {
			/**
			 * Reads data from storage resolving all configuration metadata.
			 * Iterates over each config, decrypts/parses the raw value, maps it
			 * to the adequate store property, and performs a single combined `patchState`
			 * for maximum performance.
			 */
			readFromStorage(): void {
				let combinedPatch: Partial<State> = {};
				for (const config of configs) {
					const {
						key,
						parse,
						rehydrate: customRehydrate,
						discoveredKey,
					} = config;
					const rawData = readValueFromStorage(storage, key, parse);
					if (rawData === null) continue;

					let patch: Partial<State> = {};
					if (customRehydrate) {
						patch = customRehydrate(rawData);
					} else if (discoveredKey) {
						patch = { [discoveredKey]: rawData } as Partial<State>;
					} else if (typeof rawData === "object" && rawData !== null) {
						patch = rawData as Partial<State>;
					} else {
						console.warn(
							`[withStorageSync] Key '${key}' was retrieved but no routing mapping or rehydrate logic found.`,
						);
						continue;
					}
					combinedPatch = { ...combinedPatch, ...patch };
				}

				if (Object.keys(combinedPatch).length > 0) {
					patchState(store, combinedPatch);
				}
			},

			/**
			 * Persists the configured slices into storage.
			 * Evaluates each configuration selector against the current comprehensive state,
			 * stringifying it before pushing it strictly to the Storage Provider.
			 */
			writeToStorage(): void {
				const state = getState(store);
				for (const config of configs) {
					const { key, select, stringify } = config;
					writeValueToStorage(storage, key, select(state as State), stringify);
				}
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
		};
	};
}
