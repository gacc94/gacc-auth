import type { NormalizedSyncConfig, StorageSyncConfig } from "./models";
import type { StorageProvider } from "./storage.service";

/**
 * Autodiscovers the state property key targeted by the selector function using a Proxy trap.
 * This removes the need for consumers to specify explicit string keys if they select direct root properties.
 *
 * @template State The shape of the store's state.
 * @param {NormalizedSyncConfig<State>} config The synchronization configuration object.
 * @returns {keyof State | undefined} The inferred property key or explicitly defined stateKey, or undefined if deeply nested.
 */
export function discoverStateKey<State extends object>(
	config: NormalizedSyncConfig<State>,
): keyof State | undefined {
	if (config.stateKey || config.rehydrate) return config.stateKey;

	const accessedKeys = new Set<keyof State>();
	const IS_PROXY = Symbol("IS_PROXY");

	const nestedProxy = (): unknown =>
		new Proxy(
			{},
			{
				get: (_, prop) => {
					if (prop === IS_PROXY) return true;
					return nestedProxy();
				},
			},
		);

	const discoveryProxy = new Proxy({} as never, {
		get(_, prop) {
			if (prop === IS_PROXY) return true;
			accessedKeys.add(prop as keyof State);
			return nestedProxy();
		},
	});

	let isDirectSlice = false;
	try {
		const result = config.select(discoveryProxy);
		if (
			result !== null &&
			(typeof result === "object" || typeof result === "function") &&
			(result as Record<symbol, unknown>)[IS_PROXY]
		) {
			isDirectSlice = true;
		}
	} catch {}

	// Only return the key if it was a direct slice (state => state.prop)
	// and exactly one root property was accessed.
	// This prevents double nesting if users return wrapped objects like `state => ({ prop: state.prop })`
	if (isDirectSlice && accessedKeys.size === 1) {
		return Array.from(accessedKeys)[0];
	}

	return undefined;
}

/**
 * Normalizes the user input mapping configuration(s) into a unified Array structure.
 * Additionally integrates auto-discovery processes for state properties seamlessly.
 *
 * @template State The shape of the store's state.
 * @param {StorageSyncConfig<State> | StorageSyncConfig<State>[]} options A single object or an array of configuration options.
 * @returns {NormalizedSyncConfig<State>[]} A formatted array of configs ready for strategy processing.
 */
export function normalizeSyncConfigs<State extends object>(
	options: StorageSyncConfig<State> | StorageSyncConfig<State>[],
): NormalizedSyncConfig<State>[] {
	const configs = Array.isArray(options) ? options : [options];
	return configs.map((config) => {
		const select = config.select ?? ((state: State) => state);
		const normalizedConfig = {
			...config,
			select,
		} as NormalizedSyncConfig<State>;
		normalizedConfig.discoveredKey = discoverStateKey(normalizedConfig);
		return normalizedConfig;
	});
}

/**
 * Reads and immediately parses data from a specific storage provider gracefully.
 * Resolves errors natively ensuring the system doesn't crash on corrupted JSON entries.
 *
 * @param {StorageProvider} storage The active storage API instance to query from.
 * @param {string} key The unique item identifier allocated in the storage.
 * @param {Function} [parse] Optional custom parse function (defaults to JSON.parse).
 * @returns {unknown | null} The fully parsed object or null if it cannot be loaded.
 */
export function readValueFromStorage(
	storage: StorageProvider,
	key: string,
	parse?: (value: string) => unknown,
): unknown | null {
	try {
		const stateString = storage.getItem(key);
		if (stateString === null) return null;
		return parse ? parse(stateString) : JSON.parse(stateString);
	} catch (error) {
		console.error(`[withStorageSync] Failed to rehydrate key '${key}':`, error);
		return null;
	}
}

/**
 * Serializes and dumps target data into a specific storage provider.
 * Catches 'QuotaExceededError' implicitly without breaking Angular's runtime cycle.
 *
 * @param {StorageProvider} storage The active storage API instance to query from.
 * @param {string} key The unique item identifier allocated in the storage.
 * @param {unknown} dataToSave The piece of state to be saved.
 * @param {Function} [stringify] Optional stringifier function (defaults to JSON.stringify).
 */
export function writeValueToStorage(
	storage: StorageProvider,
	key: string,
	dataToSave: unknown,
	stringify?: (value: unknown) => string,
): void {
	try {
		const valueToStore = stringify
			? stringify(dataToSave)
			: JSON.stringify(dataToSave);
		storage.setItem(key, valueToStore);
	} catch (error) {
		console.error(`[withStorageSync] Failed to save key '${key}':`, error);
	}
}

/**
 * Removes a specific key from the storage provider gracefully.
 *
 * @param {StorageProvider} storage The active storage API instance to query from.
 * @param {string} key The unique item identifier to remove.
 */
export function removeValueFromStorage(
	storage: StorageProvider,
	key: string,
): void {
	try {
		storage.removeItem(key);
	} catch (error) {
		console.error(`[withStorageSync] Failed to remove key '${key}':`, error);
	}
}

/**
 * Clears all data from the specific storage provider.
 * Use with caution as this affects the entire storage domain.
 *
 * @param {StorageProvider} storage The active storage API instance to clear.
 */
export function clearStorageProvider(storage: StorageProvider): void {
	try {
		storage.clear();
	} catch (error) {
		console.error(`[withStorageSync] Failed to clear storage:`, error);
	}
}
