import type { WritableStateSource } from "@ngrx/signals";

/**
 * @interface StorageSyncConfig
 * @description Defines the configuration for synchronizing a specific slice of the state.
 * @template State The shape of the store state.
 */
export interface StorageSyncConfig<State extends object> {
	/** The unique storage key. */
	key: string;
	/** Selector function to extract the piece of state to be saved. Defaults to `(state) => state`. */
	select?: (state: State) => unknown;
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
	extends Omit<StorageSyncConfig<State>, "select"> {
	/** The inferred property key derived via Proxy discovery, if applicable. */
	discoveredKey?: keyof State;
	/** The resolved selector function, always defined in normalized configurations. */
	select: (state: State) => unknown;
}

/**
 * @interface StorageSyncSettings
 * @description Global lifecycle settings for the `withStorageSync` feature.
 * These settings control the overall behavior of the feature, independently of
 * the individual slice configurations.
 *
 * @example
 * ```typescript
 * withStorageSync(
 *   { key: 'user', select: (state) => state.user },
 *   withSessionStorage(),
 *   { autoClear: true } // Removes all keys when the store is destroyed
 * )
 * ```
 */
export interface StorageSyncSettings {
	/**
	 * When `true`, all synchronized storage keys will be automatically removed
	 * via `removeFromStorage()` when the store's `onDestroy` lifecycle hook fires.
	 *
	 * Best used for component-scoped stores (not `providedIn: 'root'`) to ensure
	 * no stale data remains in storage after the feature is unmounted.
	 *
	 * @default false
	 */
	autoClear?: boolean;
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
	/** Removes only the specifically configured synchronization keys from the storage. */
	removeFromStorage(): void;
	/** Completely clears all data from the active storage provider. Use with extreme caution. */
	clearStorage(): void;
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
