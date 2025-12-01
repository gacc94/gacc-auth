import {
    ApplicationConfig,
    importProvidersFrom,
    provideBrowserGlobalErrorListeners,
    provideEnvironmentInitializer,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { FirebaseOptions } from '@angular/fire/app';
import { storageProviders } from '@shared/storages/storage.provider';

const environmentInitializer = provideEnvironmentInitializer(() => {
    // const store = inject(AuthStore);
});

const firebaseConfig: FirebaseOptions = {
    projectId: 'auth-ngrx-signal',
    appId: '1:631782838049:web:d5f2eca614d9b8668a7860',
    storageBucket: 'auth-ngrx-signal.firebasestorage.app',
    apiKey: 'AIzaSyBbcA-MPOap_GkGatgogavuUOviTZ9gM7s',
    authDomain: 'auth-ngrx-signal.firebaseapp.com',
    messagingSenderId: '631782838049',
    // projectNumber: '631782838049',
    // version: '2',
};

export const appConfig: ApplicationConfig = {
    providers: [
        environmentInitializer,
        ...storageProviders,
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withFetch()),
        provideFirebaseApp(() => initializeApp(firebaseConfig)),
        provideAuth(() => {
            const app = getApp();
            return getAuth(app);
        }),
    ],
};
