import { inject, type Type } from "@angular/core";
import { getState, patchState, type WritableStateSource } from "@ngrx/signals";
import { LocalStorageService, SessionStorageService } from "./storage.service";

/**
 * Configuration for state synchronization with storage.
 * @template State - The shape of the state to be synchronized.
 */
export type SyncConfig<State> = {
	/** Unique key for storage entry */
	key: string;
	/** Whether to automatically sync on init and state changes. Defaults to true. */
	autoSync?: boolean;
	/** Optional selector to pick a specific slice of the state to persist. Defaults to full state. */
	select?: (state: State) => unknown;
	/** Optional key in the state where the persisted value should be restored to. */
	stateKey?: keyof State;
	/** Function to transform the stored string back into the desired type. Defaults to JSON.parse. */
	parse?: (stateString: string) => unknown;
	/** Function to transform the state slice into a string for storage. Defaults to JSON.stringify. */
	stringify?: (data: unknown) => string;
	/** Optional custom storage getter. Defaults to localStorage. */
	storage?: () => Storage | null;
};

/**
 * Normalized configuration used by internal strategies.
 */
export type NormalizedSyncConfig<State> = Required<
	Omit<SyncConfig<State>, "stateKey">
> & {
	stateKey?: keyof State;
};

/**
 * Methods provided by the synchronization strategy.
 */
export type SyncMethods = {
	/** Clears the specific entry from the storage. */
	clearStorage(): void;
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
 */
export type SyncStorageStrategy<State extends object> = (
	config: NormalizedSyncConfig<State>,
	store: SyncStoreForFactory<State>,
) => SyncMethods;

/**
 * Internal factory to create standard synchronization methods for a given storage service.
 * @param StorageServiceToken - The injectable token for the storage service to use.
 */
function createSyncMethods<State extends object>(
	StorageServiceToken: Type<LocalStorageService | SessionStorageService>,
): SyncStorageStrategy<State> {
	return (config, store) => {
		const storage = inject(StorageServiceToken);
		const { key, parse, select, stringify, stateKey } = config;

		return {
			clearStorage(): void {
				storage.removeItem(key);
			},

			readFromStorage(): void {
				const stateString = storage.getItem(key);
				if (!stateString) return;

				try {
					const parsedData = parse(stateString);

					// Hybrid Logic: Specific key vs. Partial object
					if (stateKey) {
						// Case 1: The value belongs to a specific property in the store.
						patchState(store, { [stateKey]: parsedData } as Partial<State>);
					} else {
						// Case 2: The value is a partial slice of the state object (or full state).
						patchState(store, parsedData as Partial<State>);
					}
				} catch (error) {
					console.error(
						`[withStorageSync] Failed to parse storage key '${key}':`,
						error,
					);
				}
			},

			writeToStorage(): void {
				const state = getState(store);
				const dataToSave = select(state as State);
				try {
					storage.setItem(key, stringify(dataToSave));
				} catch (error) {
					console.error(
						`[withStorageSync] Failed to save key '${key}' to storage:`,
						error,
					);
				}
			},
		};
	};
}

/**
 * Local Storage synchronization strategy.
 */
export function withLocalStorage<
	State extends object,
>(): SyncStorageStrategy<State> {
	return createSyncMethods<State>(LocalStorageService);
}

/**
 * Session Storage synchronization strategy.
 */
export function withSessionStorage<
	State extends object,
>(): SyncStorageStrategy<State> {
	return createSyncMethods<State>(SessionStorageService);
}
