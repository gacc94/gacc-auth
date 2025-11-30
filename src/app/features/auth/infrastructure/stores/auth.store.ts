import { tapResponse } from '@ngrx/operators';
import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withProps } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { defer, map, pipe, switchMap, tap } from 'rxjs';
import { AuthFirebaseService } from '../https/auth.firebase';
import { UserMapper } from '../mappers/user.mapper';
import { Router, ActivatedRoute } from '@angular/router';
import { withInit } from './features/init.feature';
import { withDevTools, withStorage } from '@shared/stores/features';
import { withSessionStorage, withStorageSync } from '@angular-architects/ngrx-toolkit';
import { AuthState } from '../states/auth.state';

/**
 * The store for handling authentication state.
 */
export const AuthStore = signalStore(
    { providedIn: 'root' },
    withDevTools('AuthStore'),

    /**
     * The initial state of the store.
     */
    withInit(),

    withStorage({ key: 'user' }),
    // withStorageSync(
    //     {
    //         key: 'user',
    //         select: (state: AuthState) => state,
    //         autoSync: true,
    //     },
    //     withSessionStorage(),
    // ),

    /**
     * Additional properties injected into the store.
     */
    withProps(() => ({
        _auth: inject(AuthFirebaseService),
        _router: inject(Router),
        _activatedRoute: inject(ActivatedRoute),
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
                                store._router.navigate(['/dashboard']);
                            },
                            error: (error: Error) => {
                                patchState(store, { isLoading: false, error });
                            },
                        }),
                    );
                }),
            ),
        ),

        signOut: () => {
            patchState(store, { user: null, isLoading: false, error: null });
            store._router.navigate(['/auth']);
        },
    })),

    withHooks({
        onInit: (store) => {
            console.log('init');
        },
        onDestroy: (store) => {
            console.log('destroy');
            // patchState(store, { user: null, isLoading: false, error: null });
        },
    }),
);
