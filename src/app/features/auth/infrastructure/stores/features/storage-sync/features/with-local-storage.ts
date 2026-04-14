import type { SyncStorageStrategy } from "../internal/models";
import { LocalStorageService } from "../internal/storage.service";
import { createStorageStrategy } from "../internal/strategy-factory";

/**
 * Strategy Wrapper for LocalStorage integration.
 * Injects `LocalStorageService` to handle asynchronous operations.
 * Highly decoupled from direct DOM access to ensure cross-platform safety.
 *
 * @template State The shape of the SignalStore state.
 * @returns {SyncStorageStrategy<State>} Formatted strategy ready to be interpreted by `withStorageSync`.
 */
export function withLocalStorage<
	State extends object,
>(): SyncStorageStrategy<State> {
	return createStorageStrategy<State>(LocalStorageService);
}

