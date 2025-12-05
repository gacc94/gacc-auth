import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import {
    EmptyFeatureResult,
    signalStoreFeature,
    SignalStoreFeature,
    SignalStoreFeatureResult,
    watchState,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import { SyncConfig, SyncStorageStrategy, SyncStoreForFactory, withLocalStorage, withSessionStorage } from './storage.strategies';

// --- FEATURE ---
export function withStorageSync<Input extends SignalStoreFeatureResult>(
    configOrKey: SyncConfig<Input['state']> | string,
    storageStrategy?: SyncStorageStrategy<Input['state']>,
): SignalStoreFeature<Input, EmptyFeatureResult> {
    // Normalización
    const config: Required<SyncConfig<Input['state']>> = {
        autoSync: true,
        select: (state) => state,
        parse: JSON.parse,
        stringify: JSON.stringify,
        storage: () => localStorage,
        stateKey: undefined as any, // Inicializamos undefined
        ...(typeof configOrKey === 'string' ? { key: configOrKey } : configOrKey),
    };

    // Selección de Estrategia
    const factory = storageStrategy ?? (config.storage() === localStorage ? withLocalStorage() : withSessionStorage());

    return signalStoreFeature(
        withMethods((store, platformId = inject(PLATFORM_ID)) => {
            return factory(
                config,
                // CASTING NECESARIO: Soluciona el error de TypeScript con los tipos internos
                store as unknown as SyncStoreForFactory<Input['state']>,
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
