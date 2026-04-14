import type { WritableStateSource } from "@ngrx/signals";

/**
 * @interface StorageSyncConfig
 * @description Defines the configuration for synchronizing a specific slice of the state.
 * @template State The shape of the store state.
 */
export interface StorageSyncConfig<State extends object> {
	/** The unique storage key. */
	key: string;
	/** Selector function to extract the piece of state to be saved. */
	select: (state: State) => unknown;
	/** Optional function to map the raw parsed data into a partial state update. */
	rehydrate?: (value: unknown) => Partial<State>;
	/** Optional custom parser to decode the stringified data. Defaults to `JSON.parse`. */
	parse?: (value: string) => unknown;
	/** Optional custom serializer for the data. Defaults to `JSON.stringify`. */
	stringify?: (value: unknown) => string;
	/** Explicit property name in the store where the data should be patched. Bypasses auto-discovery. */
	stateKey?: keyof State;
}

/**
 * @interface NormalizedSyncConfig
 * @description Internal configuration representation that includes the auto-discovered key metadata.
 * @template State The shape of the store state.
 */
export interface NormalizedSyncConfig<State extends object>
	extends StorageSyncConfig<State> {
	/** The inferred property key derived via Proxy discovery, if applicable. */
	discoveredKey?: keyof State;
}

/**
 * @type StorageSyncOptions
 * @description Configuration options accepted by the `withStorageSync` feature. Can be a single config or an array of them.
 * @template State The shape of the store state.
 */
export type StorageSyncOptions<State extends object> =
	| StorageSyncConfig<State>
	| StorageSyncConfig<State>[];

/**
 * @type SyncMethods
 * @description Methods mapped into the SignalStore allowing external control of the storage mechanisms.
 */
export type SyncMethods = {
	/** Reads data from storage resolving all configurations to hydrate the SignalStore. */
	readFromStorage(): void;
	/** Extracts the targeted slices from the SignalStore and persists them. */
	writeToStorage(): void;
};

/**
 * @type SyncStoreForFactory
 * @description Alias reflecting a generic updatable state store source for DI.
 */
export type SyncStoreForFactory<State extends object> =
	WritableStateSource<State>;

/**
 * @type SyncStorageStrategy
 * @description Function type describing the contract for any custom synchronization adapter.
 */
export type SyncStorageStrategy<State extends object> = (
	configs: NormalizedSyncConfig<State>[],
	store: SyncStoreForFactory<State>,
) => SyncMethods;

