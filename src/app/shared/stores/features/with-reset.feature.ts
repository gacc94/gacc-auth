import { inject } from "@angular/core";
import {
	getState,
	patchState,
	signalStoreFeature,
	withHooks,
	withMethods,
} from "@ngrx/signals";
import {
	type ResettableStore,
	StoreRegistryService,
} from "../store-registry.service";

/**
 * Feature de SignalStore que permite el reinicio del estado a su valor inicial
 * y registra la store en un registry global para limpiezas masivas.
 */
export function withReset() {
	return signalStoreFeature(
		withMethods((store) => {
			let initialState: any = null;

			return {
				/**
				 * Captura el estado actual como el estado inicial para futuros resets.
				 * @internal Uso interno por los hooks del feature.
				 */
				_captureInitialState(): void {
					if (!initialState) {
						// Clonamos para evitar referencias al estado mutable
						initialState = JSON.parse(JSON.stringify(getState(store)));
					}
				},
				/**
				 * Reinicia el estado de esta store a su valor original.
				 */
				resetState(): void {
					if (initialState) {
						patchState(store, initialState);
					}
				},
			};
		}),
		withHooks((store) => {
			const registry = inject(StoreRegistryService);

			return {
				onInit() {
					// Capturamos el estado base una vez inicializados todos los features previos
					store._captureInitialState();
					// Registramos en el servicio global
					registry.register(store as unknown as ResettableStore);
				},
				onDestroy() {
					// Limpiamos el registro para evitar fugas de memoria
					registry.unregister(store as unknown as ResettableStore);
				},
			};
		}),
	);
}
