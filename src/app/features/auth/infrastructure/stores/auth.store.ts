import { tapResponse } from '@ngrx/operators';
import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { defer, map, pipe, switchMap, tap } from 'rxjs';
import { AuthFirebaseService } from '../https/auth.firebase';
import { UserMapper } from '../mappers/user.mapper';
import { Router } from '@angular/router';
import { withInit } from './features/init.feature';

/**
 * The store for handling authentication state.
 */
export const AuthStore = signalStore(
    // { providedIn: 'root' },
    /**
     * The initial state of the store.
     */
    withInit(),

    /**
     * Additional properties injected into the store.
     */
    withProps(() => ({
        _auth: inject(AuthFirebaseService),
        _router: inject(Router),
    })),

    /**
     * Additional methods for the store.
     */
    withMethods((store) => ({
        /**
         * Sign in with Google and update the store with the new user state.
         * @returns An observable that completes when the sign in process is finished.
         */
        signIn: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                switchMap(() => {
                    return defer(() => store._auth.signInWithGoogle()).pipe(
                        map((user) => UserMapper.toUserState(user)),
                        tapResponse({
                            next: (user) => {
                                patchState(store, { user, isLoading: false });
                                store._router.navigate(['/']);
                            },
                            error: (error: Error) => {
                                patchState(store, { isLoading: false, error });
                            },
                        }),
                    );
                }),
            ),
        ),
    })),

    withHooks({
        onInit: (store) => {
            // store.signIn();
        },
        onDestroy: (store) => {
            console.log('destroy');
            // patchState(store, { user: null, isLoading: false, error: null });
        },
    }),
);
