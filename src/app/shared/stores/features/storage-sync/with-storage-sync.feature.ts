import { isPlatformServer } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
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
export function withStorageSync<Input extends SignalStoreFeatureResult>(
	configOrKey: SyncConfig<Input["state"]> | string,
	storageStrategy?: SyncStorageStrategy<Input["state"]>,
): SignalStoreFeature<Input, EmptyFeatureResult> {
	// Normalización
	const config: Required<SyncConfig<Input["state"]>> = {
		autoSync: true,
		select: (state) => state,
		parse: (s) => JSON.parse(s),
		stringify: (v) => JSON.stringify(v),
		storage: () => localStorage,
		stateKey: undefined as unknown as keyof Input["state"], // Cast seguro para evitar Biome warning
		...(typeof configOrKey === "string" ? { key: configOrKey } : configOrKey),
	};

	// Selección de Estrategia
	const factory =
		storageStrategy ??
		(config.storage() === localStorage
			? withLocalStorage()
			: withSessionStorage());

	return signalStoreFeature(
		withMethods((store, platformId = inject(PLATFORM_ID)) => {
			return factory(
				config,
				// CASTING NECESARIO: Soluciona el error de TypeScript con los tipos internos
				store as unknown as SyncStoreForFactory<Input["state"]>,
				isPlatformServer(platformId),
			);
		}),
		withHooks({
			onInit(store, platformId = inject(PLATFORM_ID)) {
				if (isPlatformServer(platformId)) return;

				if (config.autoSync) {
					store.readFromStorage();
					watchState(store, () => store.writeToStorage());
				}
			},
		}),
	);
}
