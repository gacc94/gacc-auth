import { inject, type Type } from "@angular/core";
import { getState, patchState, type WritableStateSource } from "@ngrx/signals";
import { LocalStorageService, SessionStorageService } from "./storage.services";
// Importamos la config desde el feature (Archivo 3)

// --- TIPOS ---

export type SyncMethods = {
	clearStorage(): void;
	readFromStorage(): void;
	writeToStorage(): void;
};

export type SyncConfig<State> = {
	key: string;
	autoSync?: boolean;

	// CAMBIO 1: El selector ahora puede devolver cualquier cosa (primitivos incluidos)
	select?: (state: State) => unknown;

	// CAMBIO 2: Nueva propiedad opcional.
	// Si guardas un primitivo, DIME a qué propiedad del store pertenece.
	stateKey?: keyof State | undefined;

	parse?: (stateString: string) => unknown;
	stringify?: (state: unknown) => string;
	storage?: () => Storage;
};
// Tipo compatible con el Store
export type SyncStoreForFactory<State extends object> =
	WritableStateSource<State>;

// Definición de la estrategia
export type SyncStorageStrategy<State extends object> = (
	config: Required<SyncConfig<State>>,
	store: SyncStoreForFactory<State>,
	isServer: boolean,
) => SyncMethods;

// --- IMPLEMENTACIÓN ---

function createSyncMethods<State extends object>(
	StorageServiceToken: Type<LocalStorageService | SessionStorageService>,
): SyncStorageStrategy<State> {
	return (config, store, isServer) => {
		if (isServer) {
			return {
				clearStorage: () => undefined,
				readFromStorage: () => undefined,
				writeToStorage: () => undefined,
			};
		}

		const storage = inject(StorageServiceToken);
		// Destructuramos la nueva propiedad stateKey
		const { key, parse, select, stringify, stateKey } = config;

		return {
			clearStorage(): void {
				storage.clear(key);
			},

			readFromStorage(): void {
				const stateString = storage.getItem(key);
				if (stateString) {
					try {
						const parsedData = parse(stateString);

						// 🔥 LÓGICA HÍBRIDA (Objeto vs Primitivo) 🔥
						if (stateKey) {
							// CASO 1: Es un valor primitivo (o un objeto suelto) que pertenece a UNA propiedad.
							patchState(store, {
								[stateKey]: parsedData,
							} as Partial<State>);
						} else if (
							typeof parsedData === "object" &&
							parsedData !== null
						) {
							// CASO 2: Es un objeto parcial con la estructura del store.
							patchState(store, parsedData as Partial<State>);
						}
					} catch (error) {
						console.error(
							`[withStorageSync] Error reading/parsing key '${key}':`,
							error,
						);
					}
				}
			},

			writeToStorage() {
				const state = getState(store);
				// select puede devolver un objeto o un primitivo
				const dataToSave = select(state as State);
				storage.setItem(key, stringify(dataToSave));
			},
		};
	};
}

// Factories Exportables
export function withLocalStorage<
	State extends object,
>(): SyncStorageStrategy<State> {
	return createSyncMethods<State>(LocalStorageService);
}

export function withSessionStorage<
	State extends object,
>(): SyncStorageStrategy<State> {
	return createSyncMethods<State>(SessionStorageService);
}
