import type { WritableStateSource } from "@ngrx/signals";

/**
 * Configuration for a single storage synchronization slice.
 * @template State The type of the store state.
 */
export interface StorageSyncConfig<State extends object> {
	/** The key to use in the session storage. */
	key: string;
	/**
	 * A custom selector to pick the data to persist.
	 * The property name is automatically discovered for simple property access (e.g., `state => state.user`).
	 *
	 * @param {State} state The current store state.
	 * @returns {unknown} The slice of state to persist.
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
 * Internal representation of a normalized storage configuration
 * with its discovered state key (if applicable).
 * @template State The type of the store state.
 */
export interface NormalizedSyncConfig<State extends object>
	extends StorageSyncConfig<State> {
	/** The automatically discovered or manually provided state key. */
	discoveredKey?: keyof State;
}

/**
 * Options for the withStorageSync feature.
 * Can be a single configuration or an array of configurations.
 * @template State The type of the store state.
 */
export type StorageSyncOptions<State extends object> =
	| StorageSyncConfig<State>
	| StorageSyncConfig<State>[];

/**
 * Methods provided by the synchronization strategy.
 */
export type SyncMethods = {
	/** Reads the value from storage and hydrates the store. */
	readFromStorage(): void;
	/** Persists the current state (or slice) into the storage. */
	writeToStorage(): void;
};

/**
 * Type representing a state source that can be updated.
 */
export type SyncStoreForFactory<State extends object> =
	WritableStateSource<State>;

/**
 * Strategy factory type for storage synchronization.
 * Supports multiple normalized configurations.
 */
export type SyncStorageStrategy<State extends object> = (
	configs: NormalizedSyncConfig<State>[],
	store: SyncStoreForFactory<State>,
) => SyncMethods;

