import {
	getState,
	patchState,
	signalStoreFeature,
	type WritableStateSource,
	watchState,
	withHooks,
	withMethods,
} from "@ngrx/signals";

/**
 * Configuration for the storage synchronization feature.
 */
export interface StorageSyncConfig<State extends object> {
	/** The key to use in the session storage. */
	key: string;
	/**
	 * A custom selector to pick the data to persist.
	 * The property name is automatically discovered for simple property access (e.g., `state => state.user`).
	 */
	select: (state: State) => unknown;
	/** Optional: A custom rehydration function to map the storage value back into the state. */
	rehydrate?: (value: unknown) => Partial<State>;
	/** Optional: Custom parser for the stored string value. */
	parse?: (value: string) => unknown;
	/** Optional: Custom stringifier for the value to be stored. */
	stringify?: (value: unknown) => string;
	/** Optional: Manually specify the state key if auto-discovery is NOT desired or possible. */
	stateKey?: keyof State;
}

/**
 * A SignalStore feature that synchronizes the store state (or a selected slice) with Session Storage.
 *
 * It features "Auto-Discovery": it identifies which property you are selecting and ensures
 * that ONLY that property is patched back on reload, preserving other initial values.
 *
 * @param config The configuration for the synchronization.
 */
export function withStorageSync<State extends object>(
	config: StorageSyncConfig<State>,
) {
	return signalStoreFeature(
		{ state: {} as State },
		withMethods((store: WritableStateSource<State>) => {
			const {
				key,
				select,
				parse,
				stringify,
				rehydrate: customRehydrate,
			} = config;

			// --- Auto-Discovery Logic ---
			let discoveredKey: keyof State | undefined = config.stateKey;

			if (!discoveredKey && !customRehydrate) {
				// Use a Proxy to detect which property is being accessed in the select function
				// Using 'as never' to allow the Proxy to intercept any property access during discovery
				const discoveryProxy = new Proxy({} as never, {
					get(_, prop) {
						discoveredKey = prop as keyof State;
						// Return a nested proxy to avoid crashes if the selector accesses child properties
						const nestedProxy = (): unknown =>
							new Proxy({}, { get: () => nestedProxy() });
						return nestedProxy();
					},
				});

				try {
					select(discoveryProxy);
				} catch {
					/* Silent catch: intentional for the discovery phase */
				}
			}

			return {
				/**
				 * Reads the value from session storage and patches the store.
				 * Uses either the discovered key, a custom rehydrator, or a partial merge.
				 */
				readFromStorage: () => {
					try {
						const stateString = sessionStorage.getItem(key);
						if (stateString === null) return;

						const rawData: unknown = parse
							? parse(stateString)
							: JSON.parse(stateString);

						let patch: Partial<State>;

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
							return;
						}

						patchState(store, patch);
					} catch (error) {
						console.error(
							`[withStorageSync] Failed to rehydrate key '${key}' from session storage:`,
							error,
						);
					}
				},

				/**
				 * Writes the current state (or selected slice) to session storage.
				 */
				writeToStorage: () => {
					try {
						const state = getState(store);
						const dataToSave = select(state);

						const valueToStore = stringify
							? stringify(dataToSave)
							: JSON.stringify(dataToSave);

						sessionStorage.setItem(key, valueToStore);
					} catch (error) {
						console.error(
							`[withStorageSync] Failed to save key '${key}' to session storage:`,
							error,
						);
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
