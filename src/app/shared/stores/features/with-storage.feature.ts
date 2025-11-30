import { computed, effect, InjectionToken } from '@angular/core';
import { patchState, signalStoreFeature, StateSignals, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import type { Storage } from '@shared/storages/storage.model';
import { SESSION_STORAGE_TOKEN } from '@shared/storages/storage.provider';

export interface WithStorageConfig {
    key: string;
    storageToken?: InjectionToken<Storage>;
    select?: (store: any) => any;
}

/**
 * Feature para persistir estado en storage
 *
 * - Carga valores del storage y hace merge con estado inicial
 * - Guarda solo lo que selecciones con select()
 * - Usa tu implementación de Storage (con parse/stringify ya incluido)
 */
export function withStorage(config: WithStorageConfig) {
    return signalStoreFeature(
        withProps(() => ({
            _storage: inject(SESSION_STORAGE_TOKEN),
        })),

        withComputed((store: any) => ({
            storeComputed: computed(() => {
                return store;
            }),
        })),

        withHooks({
            onInit(store: any) {
                const saved = store._storage.getItem(config.key);

                if (saved) {
                    patchState(store, saved);
                }

                // 2. GUARDAR: Auto-save en cada cambio
                effect(() => {
                    const state: Record<string, any> = {};

                    for (let key in store) {
                        try {
                            if (typeof store[key]() !== 'function' && !key.startsWith('_')) {
                                try {
                                    console.log({ key, value: store[key]() });
                                    state[key] = store[key]();
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        } catch (error) {
                            console.log((error as any).message);
                        }
                    }

                    store._storage.setItem(config.key, state);
                });
            },
        }),
    );
}
