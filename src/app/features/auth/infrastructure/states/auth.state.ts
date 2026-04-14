import type { UserState } from "./user.state";

export interface AuthState {
	user: UserState | null;
	isLoading: boolean;
	error: Error | null;
}
