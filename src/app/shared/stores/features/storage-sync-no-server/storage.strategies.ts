import { inject, type Type } from "@angular/core";
import { getState, patchState, type WritableStateSource } from "@ngrx/signals";
import { LocalStorageService, SessionStorageService } from "./storage.service"; // Importamos la config desde el feature (Archivo 3)

// --- TIPOS ---

export type SyncConfig<State> = {
	key: string;
	autoSync?: boolean;

	// CAMBIO 1: El selector ahora puede devolver cualquier cosa (primitivos incluidos)
	select?: (state: State) => unknown;

	// CAMBIO 2: Nueva propiedad opcional.
	// Si guardas un primitivo, DIME a qué propiedad del store pertenece.
	stateKey?: keyof State;

	parse?: (stateString: string) => any;
	stringify?: (state: any) => string;
	storage?: () => Storage;
};

export type SyncMethods = {
	clearStorage(): void;
	readFromStorage(): void;
	writeToStorage(): void;
};

// Tipo compatible con el Store para el factory
export type SyncStoreForFactory<State extends object> =
	WritableStateSource<State>;

// Definición de la estrategia (Ya NO recibe isServer)
export type SyncStorageStrategy<State extends object> = (
	config: Required<SyncConfig<State>>,
	store: SyncStoreForFactory<State>,
) => SyncMethods;

// --- IMPLEMENTACIÓN ---

function createSyncMethods<State extends object>(
	StorageServiceToken: Type<LocalStorageService | SessionStorageService>,
): SyncStorageStrategy<State> {
	return (config, store) => {
		// Inyección directa del servicio de storage
		const storage = inject(StorageServiceToken);

		// Destructuramos la configuración
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

						// 🔥 LÓGICA HÍBRIDA (Objeto vs Primitivo/StateKey) 🔥
						if (stateKey) {
							// CASO 1: Es un valor que pertenece a UNA propiedad específica.
							// Envolvemos el dato: { [stateKey]: valor } para que patchState funcione.
							patchState(store, { [stateKey]: parsedData } as Partial<State>);
						} else {
							// CASO 2: Es un objeto parcial (slice) que ya tiene la estructura del store.
							// patchState lo usa directamente.
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
				// Ejecutamos el selector (devuelve un objeto o un primitivo)
				const dataToSave = select(state as State);
				try {
					storage.setItem(key, stringify(dataToSave));
				} catch (error) {
					console.error(
						`[withStorageSync] Error saving key '${key}' to storage:`,
						error,
					);
				}
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
