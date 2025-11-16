import { UserState } from '../states/user.state';
import { User } from '@features/auth/domain/entities/user';
import { UserCredential } from '@angular/fire/auth';

export class UserMapper {
    static toUserFromState(userState: UserState): User {
        return new User('', userState.refreshToken, userState.displayName, userState.email, userState.photoURL, userState.uid);
    }

    static toUserState(domain: User): UserState {
        const userState: UserState = {
            accessToken: domain.accessToken,
            refreshToken: domain.refreshToken,
            displayName: domain.displayName,
            email: domain.email,
            photoURL: domain.photoURL,
            uid: domain.uid,
            isAuthenticated: domain.isAuthenticated,
        };
        return userState;
    }

    static toUserFromFirebase(user: UserCredential): User {
        return new User(
            '',
            user.user.refreshToken ?? '',
            user.user.displayName ?? '',
            user.user.email ?? '',
            user.user.photoURL ?? '',
            user.user.uid ?? '',
        );
    }
}
