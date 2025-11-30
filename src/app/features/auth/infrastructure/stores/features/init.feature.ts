import { signalStoreFeature, withState } from '@ngrx/signals';
import { AuthState } from '../../states/auth.state';
import { withDevtools, withSessionStorage, withStorageSync } from '@angular-architects/ngrx-toolkit';

const initAuhtState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
};

export const withInit = () => {
    return signalStoreFeature(
        withState(() => initAuhtState),

        // withDevtools('AuthStore'), // @TODO: only development
        // withStorageSync(
        //     {
        //         key: 'auth',
        //         select: (state) => state,
        //     },
        //     withSessionStorage(),
        // ),
    );
};
