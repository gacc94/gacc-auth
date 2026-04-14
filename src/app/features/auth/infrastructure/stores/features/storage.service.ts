import { DOCUMENT } from "@angular/common";
import { Injectable, InjectionToken, inject } from "@angular/core";

/**
 * @interface StorageProvider
 * @description Abstract interface defining the contract for storage implementations.
 * Enables consistency and interchangeability between LocalStorage, SessionStorage,
 * and custom in-memory providers (useful for SSR or testing environments).
 */
export interface StorageProvider {
	/**
	 * Retrieves an item from the storage.
	 * @param {string} key - The unique key identifier for the stored item.
	 * @returns {string | null} The value associated with the key, or null if the key does not exist.
	 */
	getItem(key: string): string | null;

	/**
	 * Stores a string value under a specific key.
	 * @param {string} key - The unique key identifier.
	 * @param {string} data - The stringified data to be stored.
	 */
	setItem(key: string, data: string): void;

	/**
	 * Removes a specific item from the storage.
	 * @param {string} key - The unique key of the item to remove.
	 */
	removeItem(key: string): void;

	/**
	 * Clears all items currently saved in the storage.
	 */
	clear(): void;
}

/**
 * @constant BROWSER_LOCAL_STORAGE
 * @description Injection Token providing safe access to the browser's `localStorage` API.
 * By utilizing the injected `DOCUMENT`, this ensures SSR (Server-Side Rendering) safety
 * where the global `window` object might not be available.
 * @type {InjectionToken<Storage | null>}
 */
export const BROWSER_LOCAL_STORAGE: InjectionToken<Storage | null> =
	new InjectionToken<Storage | null>("Browser Local Storage", {
		providedIn: "root",
		factory: () => inject(DOCUMENT).defaultView?.localStorage ?? null,
	});

/**
 * @constant BROWSER_SESSION_STORAGE
 * @description Injection Token providing safe access to the browser's `sessionStorage` API.
 * Ensures SSR compatibility by accessing `sessionStorage` via the injected `DOCUMENT`.
 * @type {InjectionToken<Storage | null>}
 */
export const BROWSER_SESSION_STORAGE: InjectionToken<Storage | null> =
	new InjectionToken<Storage | null>("Browser Session Storage", {
		providedIn: "root",
		factory: () => inject(DOCUMENT).defaultView?.sessionStorage ?? null,
	});

/**
 * @class LocalStorageService
 * @implements {StorageProvider}
 * @description Angular Service acting as an adapter for `localStorage`.
 * Uses the `BROWSER_LOCAL_STORAGE` injection token to safely interact with local storage,
 * gracefully falling back to no-operations/null returns in environments without DOM access (e.g., SSR).
 */
@Injectable({ providedIn: "root" })
export class LocalStorageService implements StorageProvider {
	/**
	 * Internal reference to the LocalStorage API, injected via token for safety in SSR.
	 * @private
	 * @readonly
	 */
	private readonly storage = inject(BROWSER_LOCAL_STORAGE);

	/**
	 * Retrieves the value associated with the given key from local storage.
	 * @param {string} key - The key to retrieve.
	 * @returns {string | null} The stored string value or null if not found/unavailable.
	 */
	getItem(key: string): string | null {
		return this.storage?.getItem(key) ?? null;
	}

	/**
	 * Saves a string value to local storage associated with the provided key.
	 * @param {string} key - The key under which to store the value.
	 * @param {string} data - The string value to store.
	 */
	setItem(key: string, data: string): void {
		this.storage?.setItem(key, data);
	}

	/**
	 * Removes the value associated with the given key from local storage.
	 * @param {string} key - The key to remove.
	 */
	removeItem(key: string): void {
		this.storage?.removeItem(key);
	}

	/**
	 * Clears all stored values in the local storage.
	 */
	clear(): void {
		this.storage?.clear();
	}
}

/**
 * @class SessionStorageService
 * @implements {StorageProvider}
 * @description Angular Service acting as an adapter for `sessionStorage`.
 * Uses the `BROWSER_SESSION_STORAGE` injection token to ensure safe access,
 * preventing errors during SSR when DOM APIs are undefined.
 */
@Injectable({ providedIn: "root" })
export class SessionStorageService implements StorageProvider {
	/**
	 * Internal reference to the SessionStorage API, safely injected via token.
	 * @private
	 * @readonly
	 */
	private readonly storage = inject(BROWSER_SESSION_STORAGE);

	/**
	 * Retrieves the value associated with the given key from session storage.
	 * @param {string} key - The key to retrieve.
	 * @returns {string | null} The stored string value or null if not found/unavailable.
	 */
	getItem(key: string): string | null {
		return this.storage?.getItem(key) ?? null;
	}

	/**
	 * Saves a string value to session storage associated with the provided key.
	 * @param {string} key - The key under which to store the value.
	 * @param {string} data - The string value to store.
	 */
	setItem(key: string, data: string): void {
		this.storage?.setItem(key, data);
	}

	/**
	 * Removes the value associated with the given key from session storage.
	 * @param {string} key - The key to remove.
	 */
	removeItem(key: string): void {
		this.storage?.removeItem(key);
	}

	/**
	 * Clears all stored values in the session storage.
	 */
	clear(): void {
		this.storage?.clear();
	}
}
