import {
	type EmptyFeatureResult,
	type SignalStoreFeature,
	type SignalStoreFeatureResult,
	signalStoreFeature,
	watchState,
	withHooks,
	withMethods,
} from "@ngrx/signals";
import {
	type SyncConfig,
	type SyncStorageStrategy,
	type SyncStoreForFactory,
	withLocalStorage,
	withSessionStorage,
} from "./storage.strategies";

// --- FEATURE ---
export const withStorageSync = <Input extends SignalStoreFeatureResult>(
	configOrKey: SyncConfig<Input["state"]> | string,
	storageStrategy?: SyncStorageStrategy<Input["state"]>,
): SignalStoreFeature<Input, EmptyFeatureResult> => {
	// 1. Normalización de la configuración
	const config: Required<SyncConfig<Input["state"]>> = {
		autoSync: true,
		select: (state) => state,
		parse: JSON.parse,
		stringify: JSON.stringify,
		storage: () => localStorage,
		stateKey: undefined as any,
		...(typeof configOrKey === "string" ? { key: configOrKey } : configOrKey),
	};

	//* 2. Selección de Estrategia
	const factory =
		storageStrategy ??
		(config.storage() === localStorage
			? withLocalStorage()
			: withSessionStorage());

	return signalStoreFeature(
		withMethods((store) => {
			return factory(
				config,
				// CASTING: Necesario para evitar conflictos de tipos internos de SignalStore
				store as unknown as SyncStoreForFactory<Input["state"]>,
			);
		}),
		withHooks({
			onInit(store) {
				if (config.autoSync) {
					// A. Leer al iniciar (Hydration)
					store.readFromStorage();

					// B. Escuchar cambios y guardar (Persistence)
					watchState(store, () => store.writeToStorage());
				}
			},
		}),
	);
};
