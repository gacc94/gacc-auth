import {
	getState,
	patchState,
	signalStoreFeature,
	type WritableStateSource,
	watchState,
	withHooks,
	withMethods,
} from "@ngrx/signals";
import type { StorageSyncOptions } from "./storage-sync.types";
import {
	normalizeSyncConfigs,
	readValueFromStorage,
	writeValueToStorage,
} from "./storage-sync.utils";

/**
 * A SignalStore feature that synchronizes the store state (or selected slices) with Session Storage.
 *
 * It features "Auto-Discovery" and supports handling multiple properties via an array of configurations.
 * It ensures that ONLY the specified properties are patched back on reload, preserving other initial values.
 *
 * @template State The state type of the store.
 * @param {StorageSyncOptions<State>} options The configuration parameters (single object or array).
 * @returns A SignalStore feature to inject into the store configuration.
 *
 * @example
 * ```typescript
 * withStorageSync([
 *   { key: "auth-user", select: (state) => state.user },
 *   { key: "auth-jwt", select: (state) => state.jwt }
 * ])
 * ```
 */
export function withStorageSync<State extends object>(
	options: StorageSyncOptions<State>,
) {
	return signalStoreFeature(
		{ state: {} as State },
		withMethods((store: WritableStateSource<State>) => {
			const configs = normalizeSyncConfigs(options);

			return {
				/**
				 * Reads the values from session storage for all configurations
				 * and patches the store with the combined result.
				 */
				readFromStorage: () => {
					let combinedPatch: Partial<State> = {};

					for (const config of configs) {
						const {
							key,
							parse,
							rehydrate: customRehydrate,
							discoveredKey,
						} = config;

						const rawData = readValueFromStorage(key, parse);
						if (rawData === null) continue;

						let patch: Partial<State> = {};

						if (customRehydrate) {
							patch = customRehydrate(rawData);
						} else if (discoveredKey) {
							// If we discovered a key (e.g. 'user'), we patch specifically that key
							patch = { [discoveredKey]: rawData } as Partial<State>;
						} else if (typeof rawData === "object" && rawData !== null) {
							// Fallback: treat the stored data as a partial object
							patch = rawData as Partial<State>;
						} else {
							// Final fallback: no mapping found
							console.warn(
								`[withStorageSync] Key '${key}' was retrieved but no mapping (discoveredKey or rehydrate) found to patch it.`,
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
				 * Writes the current state's selected slices to session storage.
				 */
				writeToStorage: () => {
					const state = getState(store);

					for (const config of configs) {
						const { key, select, stringify } = config;
						const dataToSave = select(state);
						writeValueToStorage(key, dataToSave, stringify);
					}
				},
			};
		}),

		withHooks((store) => ({
			onInit: () => {
				store.readFromStorage();
				watchState(store, () => store.writeToStorage());
			},
		})),
	);
}

// Re-export types if needed by the consumer
export * from "./storage-sync.types";
