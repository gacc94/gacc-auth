import { inject, Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, getIdTokenResult, getIdToken } from '@angular/fire/auth';
import { User } from '@features/auth/domain/entities/user';

@Injectable({
    providedIn: 'root',
})
export class AuthFirebaseService {
    readonly #auth = inject(Auth);

    async signInWithGoogle(): Promise<User> {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.#auth, provider);
        const user = result.user;
        const additionalUserInfo = getAdditionalUserInfo(result);
        const idTokenResult = await getIdTokenResult(user);
        const idToken = await getIdToken(user);
        return new User(idToken, idTokenResult.expirationTime!, user.displayName!, user.email!, user.photoURL!, user.uid);
    }
}
