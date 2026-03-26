import { User } from "@features/auth/domain/entities/user";
import type { AuthState } from "@features/auth/infrastructure/states/auth.state";
import {
	type EmptyFeatureResult,
	type SignalStoreFeature,
	type SignalStoreFeatureResult,
	signalStoreFeature,
	watchState,
	withHooks,
	withMethods,
} from "@ngrx/signals";
import { LocalStorage } from "@shared/storages/local-storage";
import {
	type NormalizedSyncConfig,
	type SyncConfig,
	type SyncMethods,
	type SyncStorageStrategy,
	type SyncStoreForFactory,
	withLocalStorage,
	withSessionStorage,
} from "./storage.strategies";

/**
 * A SignalStore feature that synchronizes the store state with browser storage.
 *
 * @remarks
 * This feature provides automatic hydration (reading from storage on init)
 * and persistence (writing to storage on state changes).
 *
 * It is designed to be tree-shakable and works in both browser and SSR contexts
 * by using safe injection tokens for storage access.
 *
 * @param configOrKey - The configuration object or a string representing the storage key.
 * @param storageStrategy - Optional strategy to handle storage operations (defaults to LocalStorage).
 * @returns A SignalStore feature with storage synchronization capabilities.
 */
export function withStorageSync<Input extends SignalStoreFeatureResult>(
	configOrKey: SyncConfig<Input["state"]> | string,
	storageStrategy?: SyncStorageStrategy<Input["state"]>,
): SignalStoreFeature<Input, EmptyFeatureResult & { methods: SyncMethods }> {
	// 1. Normalize configuration with sensible defaults
	// We use NormalizedSyncConfig to acknowledge that stateKey is optional
	const config: NormalizedSyncConfig<Input["state"]> = {
		autoSync: true,
		select: (state) => state,
		parse: (str) => JSON.parse(str),
		stringify: (data) => JSON.stringify(data),
		storage: () => (typeof window !== "undefined" ? localStorage : null),
		...(typeof configOrKey === "string" ? { key: configOrKey } : configOrKey),
	};

	// 2. Determine the storage strategy factory
	const factory =
		storageStrategy ??
		(typeof window !== "undefined" && config.storage() === sessionStorage
			? withSessionStorage<Input["state"]>()
			: withLocalStorage<Input["state"]>());

	return signalStoreFeature(
		withMethods((store) => {
			// Create and return the synchronization methods using the selected factory
			return factory(config, store as SyncStoreForFactory<Input["state"]>);
		}),
		withHooks({
			onInit(store) {
				if (config.autoSync) {
					// We cast to SyncMethods because they were added by the previous feature in signalStoreFeature
					const syncMethods = store as SyncMethods;

					// A. Initial hydration: Read from storage and update the store
					syncMethods.readFromStorage();

					// B. Persistence: Watch for state changes and update the storage
					watchState(store, () => syncMethods.writeToStorage());
				}
			},
		}),
	);
}
