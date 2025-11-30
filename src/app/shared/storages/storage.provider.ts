import { SessionStorage } from './session-storage';
import { InjectionToken } from '@angular/core';
import type { Storage } from './storage.model';

export const STORAGE_PROVIDER = [
    {
        provide: Storage,
        useClass: SessionStorage,
    },
];

export const SESSION_STORAGE_TOKEN = new InjectionToken<Storage>('SESSION_STORAGE_TOKEN', {
    providedIn: 'root',
    factory: () => new SessionStorage(),
});
