import type { StorageProvider } from "./storage.service";
import type {
	NormalizedSyncConfig,
	StorageSyncConfig,
} from "./storage-sync.types";

/**
 * Attempts to automatically discover the property key used in a selector.
 *
 * @template State The type of the store state.
 * @param {StorageSyncConfig<State>} config - The synchronization configuration.
 * @returns {keyof State | undefined} The discovered key, or undefined if discovery failed or is manual.
 */
export function discoverStateKey<State extends object>(
	config: StorageSyncConfig<State>,
): keyof State | undefined {
	if (config.stateKey || config.rehydrate) {
		return config.stateKey;
	}

	let discoveredKey: keyof State | undefined;

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
		config.select(discoveryProxy);
	} catch {
		/* Silent catch: intentional for the discovery phase */
	}

	return discoveredKey;
}

/**
 * Normalizes the storage synchronization options into an array of normalized configurations.
 *
 * @template State The type of the store state.
 * @param {StorageSyncConfig<State> | StorageSyncConfig<State>[]} options - The provided options.
 * @returns {NormalizedSyncConfig<State>[]} An array of normalized configurations with discovered keys.
 */
export function normalizeSyncConfigs<State extends object>(
	options: StorageSyncConfig<State> | StorageSyncConfig<State>[],
): NormalizedSyncConfig<State>[] {
	const configs = Array.isArray(options) ? options : [options];

	return configs.map((config) => ({
		...config,
		discoveredKey: discoverStateKey(config),
	}));
}

/**
 * Retrieves and parses a value from the provided storage provider.
 *
 * @param {StorageProvider} storage - The injected storage provider (LocalStorageService / SessionStorageService).
 * @param {string} key - The storage key.
 * @param {(value: string) => unknown} [parse] - An optional custom parse function.
 * @returns {unknown | null} The parsed value, or null if the key doesn't exist.
 */
export function readValueFromStorage(
	storage: StorageProvider,
	key: string,
	parse?: (value: string) => unknown,
): unknown | null {
	try {
		const stateString = storage.getItem(key);
		if (stateString === null) {
			return null;
		}
		return parse ? parse(stateString) : JSON.parse(stateString);
	} catch (error) {
		console.error(
			`[withStorageSync] Failed to rehydrate key '${key}' from storage:`,
			error,
		);
		return null;
	}
}

/**
 * Saves a value into the provided storage provider.
 *
 * @param {StorageProvider} storage - The injected storage provider.
 * @param {string} key - The storage key.
 * @param {unknown} dataToSave - The data to be persisted.
 * @param {(value: unknown) => string} [stringify] - An optional custom stringify function.
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
		console.error(
			`[withStorageSync] Failed to save key '${key}' to storage:`,
			error,
		);
	}
}
