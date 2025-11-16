/**
 * Represents a user entity.
 */
export class User {
    /**
     * The access token.
     */
    accessToken: string;

    /**
     * The refresh token.
     */
    refreshToken: string;

    /**
     * The display name.
     */
    displayName: string;

    /**
     * The email.
     */
    email: string;

    /**
     * The photo URL.
     */
    photoURL: string;

    /**
     * The unique identifier.
     */
    uid: string;

    /**
     * Creates a new instance of User.
     * @param accessToken - The access token.
     * @param refreshToken - The refresh token.
     * @param displayName - The display name.
     * @param email - The email.
     * @param photoURL - The photo URL.
     * @param uid - The unique identifier.
     */
    constructor(accessToken: string, refreshToken: string, displayName: string, email: string, photoURL: string, uid: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.displayName = displayName;
        this.email = email;
        this.photoURL = photoURL;
        this.uid = uid;
    }

    /**
     * Indicates whether the user is authenticated.
     * @returns True if authenticated, otherwise false.
     */
    get isAuthenticated(): boolean {
        return !!this.accessToken;
    }
}
