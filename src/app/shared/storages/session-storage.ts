import { Storage } from './storage.model';

export class SessionStorage implements Storage {
    getItem<T>(key: string): T | null {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.warn('Error getting item from session storage:', error);
            return null;
        }
    }

    setItem<T>(key: string, value: T): void {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Error setting item in session storage:', error);
        }
    }

    removeItem(key: string): void {
        sessionStorage.removeItem(key);
    }

    clear(): void {
        sessionStorage.clear();
    }
}
