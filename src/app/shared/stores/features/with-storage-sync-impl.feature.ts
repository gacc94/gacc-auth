import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import {
    EmptyFeatureResult,
    signalStoreFeature,
    SignalStoreFeature,
    SignalStoreFeatureResult,
    watchState,
    withHooks,
    withMethods,
} from '@ngrx/signals';
import { Type } from '@angular/core';
import { getState, patchState, WritableStateSource } from '@ngrx/signals';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }
    setItem(key: string, data: string): void {
        localStorage.setItem(key, data);
    }
    clear(key: string): void {
        localStorage.removeItem(key);
    }
}

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
    getItem(key: string): string | null {
        return sessionStorage.getItem(key);
    }
    setItem(key: string, data: string): void {
        sessionStorage.setItem(key, data);
    }
    clear(key: string): void {
        sessionStorage.removeItem(key);
    }
}

export interface StorageSyncConfig<State> {
    key: string; // La llave del localStorage/sessionStorage
    autoSync?: boolean; // Por defecto true
    storage?: 'local' | 'session'; // Por defecto 'local'

    // SELECTOR MÁGICO:
    // Recibe el estado PLANO (objeto), no señales.
    // Debe retornar un Partial<State> (un objeto con las mismas llaves que el store).
    select?: (state: State) => Partial<State>;

    // Transformadores opcionales (por si quieres encriptar/desencriptar)
    parse?: (text: string) => State;
    stringify?: (state: Partial<State>) => string;
}

// Tipos auxiliares para el factory
export type SyncMethods = {
    clearStorage(): void;
    readFromStorage(): void;
    writeToStorage(): void;
};

export type SyncStoreForFactory<State extends object> = WritableStateSource<State>;

export type SyncStorageStrategy<State extends object> = (
    config: Required<SyncConfig<State>>,
    store: SyncStoreForFactory<State>,
    isServer: boolean,
) => SyncMethods;

// --- Implementación de las Estrategias ---

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
        const { key, parse, select, stringify } = config;

        return {
            clearStorage(): void {
                storage.clear(key);
            },

            readFromStorage(): void {
                const stateString = storage.getItem(key);
                if (stateString) {
                    // Asumimos que parse devuelve el objeto parcial correcto
                    patchState(store, parse(stateString) as Partial<State>);
                }
            },

            writeToStorage() {
                const state = getState(store);
                const slicedState = select(state as State);
                storage.setItem(key, stringify(slicedState as State));
            },
        };
    };
}

// Factories exportables
export function withLocalStorage<State extends object>(): SyncStorageStrategy<State> {
    return createSyncMethods<State>(LocalStorageService);
}

export function withSessionStorage<State extends object>(): SyncStorageStrategy<State> {
    return createSyncMethods<State>(SessionStorageService);
}

// Definición de la Configuración
export type SyncConfig<State> = {
    key: string;
    autoSync?: boolean;
    select?: (state: State) => unknown;
    parse?: (stateString: string) => State;
    stringify?: (state: State) => string;
    storage?: () => Storage; // 👈 AHORA COINCIDE CON EL TOOLKIT
};

// --- Sobrecargas de la función (Overloads) para buena DX ---

// 1. Solo key (usa localStorage por defecto)
export function withStorageSync<Input extends SignalStoreFeatureResult>(key: string): SignalStoreFeature<Input, EmptyFeatureResult>;

// 2. Key + Estrategia (ej: withSessionStorage())
export function withStorageSync<Input extends SignalStoreFeatureResult>(
    key: string,
    storageStrategy: SyncStorageStrategy<Input['state']>,
): SignalStoreFeature<Input, EmptyFeatureResult>;

// 3. Config object (usa localStorage por defecto)
export function withStorageSync<Input extends SignalStoreFeatureResult>(
    config: SyncConfig<Input['state']>,
): SignalStoreFeature<Input, EmptyFeatureResult>;

// 4. Config object + Estrategia
export function withStorageSync<Input extends SignalStoreFeatureResult>(
    config: SyncConfig<Input['state']>,
    storageStrategy: SyncStorageStrategy<Input['state']>,
): SignalStoreFeature<Input, EmptyFeatureResult>;

// --- Implementación ---
export function withStorageSync<Input extends SignalStoreFeatureResult>(
    configOrKey: SyncConfig<Input['state']> | string,
    storageStrategy?: SyncStorageStrategy<Input['state']>,
): SignalStoreFeature<Input, EmptyFeatureResult> {
    // Normalización de la configuración
    const config: Required<SyncConfig<Input['state']>> = {
        autoSync: true,
        select: (state) => state, // Por defecto selecciona todo
        parse: JSON.parse,
        stringify: JSON.stringify,
        storage: () => localStorage,
        ...(typeof configOrKey === 'string' ? { key: configOrKey } : configOrKey),
    };

    // Determinamos la estrategia (Local o Session)
    const factory = storageStrategy ?? (config.storage() === localStorage ? withLocalStorage() : withSessionStorage());

    return signalStoreFeature(
        withMethods((store, platformId = inject(PLATFORM_ID)) => {
            return factory(
                config,
                // 👇 SOLUCIÓN AL ERROR ROJO DE TYPESCRIPT:
                // Hacemos un doble cast para evitar el conflicto con los símbolos internos [STATE_SOURCE]
                store as unknown as SyncStoreForFactory<Input['state']>,
                isPlatformServer(platformId),
            );
        }),
        withHooks({
            onInit(store, platformId = inject(PLATFORM_ID)) {
                if (isPlatformServer(platformId)) {
                    return;
                }

                if (config.autoSync) {
                    // 1. Leer al iniciar
                    store.readFromStorage();

                    // 2. Escuchar cambios
                    watchState(store, () => store.writeToStorage());
                }
            },
        }),
    );
}
