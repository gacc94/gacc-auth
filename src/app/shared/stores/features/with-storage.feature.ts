import { effect, Input, Signal } from '@angular/core';
import {
    getState,
    isWritableStateSource,
    patchState,
    signalStoreFeature,
    withHooks,
    withMethods,
    withProps,
    SignalStoreFeature,
    EmptyFeatureResult,
    SignalStoreFeatureResult,
    StateSignals,
    WritableStateSource,
    watchState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { LOCAL_STORAGE_TOKEN, SESSION_STORAGE_TOKEN } from '@shared/storages/storage.provider';

type SignalState<T> = {
    [K in keyof T]: Signal<T[K]>;
};

export type StateStore<State extends object> = WritableStateSource<State> & SignalState<State>;

type storageType = 'session' | 'local';

export interface WithStorageConfig<State extends object> {
    key: string;
    stateKey?: string;
    storage: storageType;
    select?: (store: any) => any;
}

export function withStorage<State extends object>(config: WithStorageConfig<State>) {
    return signalStoreFeature(
        withProps(() => ({
            _storage: inject(config.storage === 'session' ? SESSION_STORAGE_TOKEN : LOCAL_STORAGE_TOKEN),
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
                        const state = config.select(store)();
                        const dataSlices = { ...structuredClone(state), [config.key]: structuredClone(saved) };
                        patchState(store, dataSlices);
                    } else {
                        patchState(store, saved);
                    }
                }

                watchState(store, (state) => {
                    const dataToSave = config.select ? config.select(store)() : state;

                    store._storage.setItem(config.key, dataToSave);
                });
            },
        }),
    );
}
