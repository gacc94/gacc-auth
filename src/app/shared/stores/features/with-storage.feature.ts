import { effect, Input, inject, type Signal } from "@angular/core";
import {
	type EmptyFeatureResult,
	getState,
	patchState,
	type SignalStoreFeature,
	type SignalStoreFeatureResult,
	signalStoreFeature,
	type WritableStateSource,
	watchState,
	withHooks,
	withMethods,
	withProps,
} from "@ngrx/signals";
import {
	LOCAL_STORAGE_TOKEN,
	SESSION_STORAGE_TOKEN,
} from "@shared/storages/storage.provider";

type SignalState<T> = {
	[K in keyof T]: Signal<T[K]>;
};

export type StateStore<State extends object> = WritableStateSource<State> &
	SignalState<State>;

type storageType = "session" | "local";

export interface StorageConfig<State> {
	key: string;
	storage: storageType;
	select?: (state: State) => State[keyof State];
	stateKey: keyof State;
}

export const withStorage = <Input extends SignalStoreFeatureResult>(
	config: StorageConfig<Input["state"]>,
): SignalStoreFeature<Input, EmptyFeatureResult> => {
	return signalStoreFeature(
		withProps(() => ({
			_storage: inject(
				config.storage === "session"
					? SESSION_STORAGE_TOKEN
					: LOCAL_STORAGE_TOKEN,
			),
		})),
		withMethods((store) => ({
			removeStorage: () => {
				store._storage.removeItem(config.key);
			},
		})),

		withHooks({
			onInit(store) {
				const saved = store._storage.getItem(config.key);

				if (saved && saved !== null) {
					if (config.select) {
						const state = (config.select(store) as any)();
						const dataSlices = {
							...structuredClone(state),
							[config.stateKey]: structuredClone(saved),
						};
						patchState(store, dataSlices);
					} else {
						patchState(store, saved);
					}
				}

				watchState(store, (state) => {
					const dataToSave = config.select
						? (config.select(store) as any)()
						: state;

					store._storage.setItem(config.key, dataToSave);
				});
			},
		}),
	);
};
