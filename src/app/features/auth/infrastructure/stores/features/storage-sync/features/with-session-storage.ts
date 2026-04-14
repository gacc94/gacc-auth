import type { SyncStorageStrategy } from "../internal/models";
import { SessionStorageService } from "../internal/storage.service";
import { createStorageStrategy } from "../internal/strategy-factory";

/**
 * Strategy Wrapper for SessionStorage integration.
 * Injects `SessionStorageService` handling single-session lifetime data persistence.
 * Safe for Hybrid configurations (SSR).
 *
 * @template State The shape of the SignalStore state.
 * @returns {SyncStorageStrategy<State>} Formatted strategy ready to be interpreted by `withStorageSync`.
 */
export function withSessionStorage<
	State extends object,
>(): SyncStorageStrategy<State> {
	return createStorageStrategy<State>(SessionStorageService);
}

