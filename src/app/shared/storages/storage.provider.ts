import { SessionStorage } from './session-storage';
import { LocalStorage } from './local-storage';
import { InjectionToken, Provider } from '@angular/core';
import type { Storage } from './storage.model';

export const SESSION_STORAGE_TOKEN = new InjectionToken<Storage>('SESSION_STORAGE_TOKEN');

export const LOCAL_STORAGE_TOKEN = new InjectionToken<Storage>('LOCAL_STORAGE_TOKEN');

export const storageProviders: Provider[] = [
    {
        provide: SESSION_STORAGE_TOKEN,
        useFactory: () => new SessionStorage(),
        deps: [],
    },
    {
        provide: LOCAL_STORAGE_TOKEN,
        useFactory: () => new LocalStorage(),
        deps: [],
    },
];
