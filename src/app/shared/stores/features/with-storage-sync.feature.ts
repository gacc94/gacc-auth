import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { getState, patchState, signalStoreFeature, withHooks, withMethods, watchState } from '@ngrx/signals';

// Configuración flexible
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

export function withStorageSync<State extends object>(config: StorageSyncConfig<State>) {
    const {
        key,
        autoSync = true,
        storage = 'local',
        select = (state) => state, // Por defecto guarda TODO
        parse = JSON.parse,
        stringify = JSON.stringify,
    } = config;

    return signalStoreFeature(
        withMethods((store, platformId = inject(PLATFORM_ID)) => {
            // Helper para obtener el Storage API correcto
            const getStorage = (): Storage | null => {
                if (isPlatformServer(platformId)) return null; // Evita errores en SSR
                return storage === 'local' ? localStorage : sessionStorage;
            };

            return {
                // Método público: Leer y restaurar
                readFromStorage(): void {
                    const storageApi = getStorage();
                    if (!storageApi) return;

                    const storedValue = storageApi.getItem(key);
                    if (storedValue) {
                        try {
                            // 1. Parseamos
                            const parsedState = parse(storedValue);
                            // 2. Parcheamos DIRECTAMENTE.
                            // Como 'parsedState' ya tiene las llaves correctas, funciona solo.
                            patchState(store, parsedState as Partial<State>);
                        } catch (error) {
                            console.error(`[withStorageSync] Error reading key '${key}':`, error);
                        }
                    }
                },

                // Método público: Escribir
                writeToStorage(): void {
                    const storageApi = getStorage();
                    if (!storageApi) return;

                    // 1. Obtenemos el estado completo actual (snapshot)
                    const state = getState(store);

                    // 2. Aplicamos el selector (si existe) para filtrar qué guardar
                    const sliceToSave = select(state as State);

                    // 3. Guardamos
                    storageApi.setItem(key, stringify(sliceToSave));
                },

                // Bonus: Método para limpiar
                clearStorage(): void {
                    getStorage()?.removeItem(key);
                },
            };
        }),

        withHooks({
            onInit(store, platformId = inject(PLATFORM_ID)) {
                console.log({ platformId });
                if (isPlatformServer(platformId)) return;

                if (autoSync) {
                    // A. HIDRATACIÓN INICIAL
                    store.readFromStorage();

                    // B. SINCRONIZACIÓN AUTOMÁTICA
                    // watchState es mejor que effect aquí porque nos da el state síncrono
                    watchState(store, (_state) => {
                        store.writeToStorage();
                    });
                }
            },
        }),
    );
}
