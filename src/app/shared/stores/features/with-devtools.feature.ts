import { withDevtools as withDevtoolsAngularArchitects } from '@angular-architects/ngrx-toolkit';
import { isDevMode } from '@angular/core';
import { signalStoreFeature, withHooks } from '@ngrx/signals';

/**
 * Feature for enabling DevTools with dynamic import
 */
export function withDevTools(storeName: string) {
    const devToolsFeature = isDevMode() ? withDevtoolsAngularArchitects(storeName) : withHooks({});

    return signalStoreFeature(devToolsFeature);
}
