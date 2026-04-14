import { DOCUMENT } from "@angular/common";
import { Injectable, InjectionToken, inject } from "@angular/core";

export interface StorageProvider {
	getItem(key: string): string | null;
	setItem(key: string, data: string): void;
	removeItem(key: string): void;
	clear(): void;
}

export const BROWSER_LOCAL_STORAGE = new InjectionToken<Storage | null>(
	"Browser Local Storage",
	{
		providedIn: "root",
		factory: () => inject(DOCUMENT).defaultView?.localStorage ?? null,
	},
);

export const BROWSER_SESSION_STORAGE = new InjectionToken<Storage | null>(
	"Browser Session Storage",
	{
		providedIn: "root",
		factory: () => inject(DOCUMENT).defaultView?.sessionStorage ?? null,
	},
);

@Injectable({ providedIn: "root" })
export class LocalStorageService implements StorageProvider {
	private readonly storage = inject(BROWSER_LOCAL_STORAGE);

	getItem(key: string): string | null {
		return this.storage?.getItem(key) ?? null;
	}

	setItem(key: string, data: string): void {
		this.storage?.setItem(key, data);
	}

	removeItem(key: string): void {
		this.storage?.removeItem(key);
	}

	clear(): void {
		this.storage?.clear();
	}
}

@Injectable({ providedIn: "root" })
export class SessionStorageService implements StorageProvider {
	private readonly storage = inject(BROWSER_SESSION_STORAGE);

	getItem(key: string): string | null {
		return this.storage?.getItem(key) ?? null;
	}

	setItem(key: string, data: string): void {
		this.storage?.setItem(key, data);
	}

	removeItem(key: string): void {
		this.storage?.removeItem(key);
	}

	clear(): void {
		this.storage?.clear();
	}
}
