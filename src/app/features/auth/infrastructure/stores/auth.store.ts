import { inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	withGlitchTracking,
	// withStorageSync,
} from "@angular-architects/ngrx-toolkit";
import { User } from "@features/auth/domain/entities/user";
import { tapResponse } from "@ngrx/operators";
import {
	getState,
	patchState,
	signalStore,
	withHooks,
	withMethods,
	withProps,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { withDevTools } from "@shared/stores/features";
// import { withStorageSync } from "@shared/stores/features/storage-sync-no-server/with-storage-sync.feature";
import { defer, map, pipe, switchMap, tap } from "rxjs";
import { AuthFirebaseService } from "../https/auth.firebase";
import { UserMapper } from "../mappers/user.mapper";
import type { AuthState } from "../states/auth.state";
import { withInit } from "./features/init.feature";
import { withStorageSync } from "./features/with-storage-sync.feature";
/**
 * The store for handling authentication state.
 */
export const AuthStore = signalStore(
	{ providedIn: "root" },

	/**
	 * The initial state of the store.
	 */
	withInit(),

	withDevTools("AuthStore", withGlitchTracking()),

	// withStorageSync({
	// 	key: "user",
	// 	stateKey: "user",
	// 	storage: () => sessionStorage,
	// 	select: (state: AuthState) => state.user,
	// }),

	withStorageSync([
		{
			key: "user",
			select: (state) => state.user,
		},
		{
			key: "loading",
			select: (state) => state.isLoading,
		},
	]),

	// withStorageSync({
	// 	key: "user",
	// 	storage: () => sessionStorage,
	// 	select: (state) => state.user,
	// }),

	// withStorageSync({
	// 	key: "loading",
	// 	// stateKey: "isLoading",
	// 	storage: () => sessionStorage,
	// }),

	// withStorageSync({
	// 	key: "error",
	// 	stateKey: "error",
	// 	storage: () => sessionStorage,
	// }),

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
								patchState(store, { user: { ...user }, isLoading: false });
								store._router.navigate(["/dashboard"]);
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
			store._router.navigate(["/auth"]);
		},
	})),

	withHooks((store) => ({
		onInit: async () => {
			console.log("init");
			console.log(getState(store));
		},
		onDestroy: () => {
			console.log("destroy");
		},
	})),
);
