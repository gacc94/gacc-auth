import { inject, type Type } from "@angular/core";
import { getState, patchState } from "@ngrx/signals";
import type {
	NormalizedSyncConfig,
	SyncStorageStrategy,
} from "./storage-sync.types";
import {
	readValueFromStorage,
	writeValueToStorage,
} from "./storage-sync.utils";
import {
	LocalStorageService,
	SessionStorageService,
	type StorageProvider,
} from "./storage.service";

/**
 * Internal factory to create standard synchronization methods for a given storage service.
 * Supports multiple configurations via an array of `NormalizedSyncConfig`.
 *
 * @template State The shape of the state to be synchronized.
 * @param {Type<StorageProvider>} StorageServiceToken - The injectable token for the storage service to use.
 * @returns {SyncStorageStrategy<State>} The synchronization strategy function.
 */
export function createSyncMethods<State extends object>(
	StorageServiceToken: Type<StorageProvider>,
): SyncStorageStrategy<State> {
	return (configs, store) => {
		const storage = inject(StorageServiceToken);

		return {
			/**
			 * Reads the values from the configured storage provider for all configurations
			 * and patches the store with the combined result.
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
						// If discovered a key, patch specifically that key
						patch = { [discoveredKey]: rawData } as Partial<State>;
					} else if (typeof rawData === "object" && rawData !== null) {
						// Fallback: treat the stored data as a partial object
						patch = rawData as Partial<State>;
					} else {
						console.warn(
							`[withStorageSync] Key '${key}' was retrieved but no mapping (discoveredKey or rehydrate) found.`,
						);
						continue;
					}

					combinedPatch = { ...combinedPatch, ...patch };
				}

				// Apply patches only if there is data to rehydrate
				if (Object.keys(combinedPatch).length > 0) {
					patchState(store, combinedPatch);
				}
			},

			/**
			 * Writes the current state's selected slices to the configured storage provider.
			 */
			writeToStorage(): void {
				const state = getState(store);

				for (const config of configs) {
					const { key, select, stringify } = config;
					const dataToSave = select(state as State);
					writeValueToStorage(storage, key, dataToSave, stringify);
				}
			},
		};
	};
}

/**
 * Local Storage synchronization strategy.
 * @template State The store state type.
 * @returns {SyncStorageStrategy<State>} Strategy configured for Local Storage.
 */
export function withLocalStorage<
	State extends object,
>(): SyncStorageStrategy<State> {
	return createSyncMethods<State>(LocalStorageService);
}

/**
 * Session Storage synchronization strategy.
 * @template State The store state type.
 * @returns {SyncStorageStrategy<State>} Strategy configured for Session Storage.
 */
export function withSessionStorage<
	State extends object,
>(): SyncStorageStrategy<State> {
	return createSyncMethods<State>(SessionStorageService);
}
