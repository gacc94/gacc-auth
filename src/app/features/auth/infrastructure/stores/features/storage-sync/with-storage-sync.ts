import {
	type EmptyFeatureResult,
	type SignalStoreFeature,
	type SignalStoreFeatureResult,
	signalStoreFeature,
	watchState,
	withHooks,
	withMethods,
} from "@ngrx/signals";

import { withSessionStorage } from "./features/with-session-storage";
import type {
	StorageSyncOptions,
	StorageSyncSettings,
	SyncMethods,
	SyncStorageStrategy,
	SyncStoreForFactory,
} from "./internal/models";
import { normalizeSyncConfigs } from "./internal/utils";

/**
 * A SignalStore feature that synchronizes the store state (or selected slices) with Session Storage or Local Storage.
 *
 * It features "Auto-Discovery" and supports handling multiple properties via an array of configurations.
 * This implementation is explicitly designed for Browser environments where the DOM `window` object is guaranteed.
 *
 * The feature exposes **4 public methods** on the store:
 * - `readFromStorage()` — Manually hydrates the store from storage.
 * - `writeToStorage()` — Manually persists all configured slices to storage.
 * - `removeFromStorage()` — Removes **only** the keys managed by this sync config from storage.
 * - `clearStorage()` — Clears the **entire** storage provider. Use with extreme caution.
 *
 * @template Input The incoming state footprint of the SignalStore.
 * @param {StorageSyncOptions<Input["state"]>} options The configuration parameters (single object or array).
 * @param {SyncStorageStrategy<Input["state"]>} [storageStrategy] Optional strategy to handle storage synchronization (defaults to SessionStorage).
 * @param {StorageSyncSettings} [settings] Optional lifecycle settings (e.g., `autoClear`).
 * @returns {SignalStoreFeature} A SignalStore feature injecting hydration and bidirectional persistence methods.
 *
 * @example
 * ```typescript
 * // Basic usage — persists data permanently in SessionStorage:
 * withStorageSync(
 *   [{ key: 'user', select: (state) => state.user }],
 *   withSessionStorage()
 * )
 *
 * // Auto-clean on store destruction (ideal for component-scoped stores):
 * withStorageSync(
 *   { key: 'formDraft', select: (state) => state.draft },
 *   withLocalStorage(),
 *   { autoClear: true }
 * )
 *
 * // Manual cleanup from consuming store methods:
 * signOut() {
 *   patchState(store, initialState);
 *   store.removeFromStorage(); // Removes only the managed keys
 * }
 * ```
 */
export function withStorageSync<Input extends SignalStoreFeatureResult>(
	options: StorageSyncOptions<Input["state"]>,
	storageStrategy?: SyncStorageStrategy<Input["state"]>,
	settings?: StorageSyncSettings,
): SignalStoreFeature<Input, EmptyFeatureResult & { methods: SyncMethods }> {
	const factory = storageStrategy ?? withSessionStorage<Input["state"]>();
	const shouldAutoClear = settings?.autoClear ?? false;

	return signalStoreFeature(
		withMethods((store) => {
			const configs = normalizeSyncConfigs(options);
			return factory(configs, store as SyncStoreForFactory<Input["state"]>);
		}),
		withHooks({
			onInit(store) {
				const syncMethods = store as unknown as SyncMethods;

				// A. Initial hydration: Read from storage and update the store
				syncMethods.readFromStorage();

				// B. Persistence: Watch for state changes and update the storage
				watchState(store, () => syncMethods.writeToStorage());
			},
			onDestroy(store) {
				// C. Auto-clean: Remove only the managed keys when the store is destroyed
				if (shouldAutoClear) {
					const syncMethods = store as unknown as SyncMethods;
					syncMethods.removeFromStorage();
				}
			},
		}),
	);
}

// Re-export strategies and models for better consumer DX
export { withLocalStorage } from "./features/with-local-storage";
export { withSessionStorage } from "./features/with-session-storage";
export type * from "./internal/models";
