import { Injectable } from "@angular/core";

/**
 * Interfaz básica que deben implementar las stores para ser reseteables.
 */
export interface ResettableStore {
	resetState(): void;
}

/**
 * Servicio encargado de mantener un registro de todas las stores activas
 * que soportan la operación de reinicio (reset).
 */
@Injectable({ providedIn: "root" })
export class StoreRegistryService {
	private readonly stores = new Set<ResettableStore>();

	/**
	 * Registra una store en el listado global.
	 */
	register(store: ResettableStore): void {
		this.stores.add(store);
	}

	/**
	 * Elimina una store del listado global.
	 */
	unregister(store: ResettableStore): void {
		this.stores.delete(store);
	}

	/**
	 * Ejecuta el reinicio en todas las stores registradas.
	 * Útil para limpiezas de sesión o logs out.
	 */
	resetAll(): void {
		console.log("[StoreRegistry] Resetting all stores");
		this.stores.forEach((store) => {
			try {
				store.resetState();
			} catch (error) {
				console.error("[StoreRegistry] Error resetting store", error);
			}
		});
	}
}
