import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }
    setItem(key: string, data: string): void {
        localStorage.setItem(key, data);
    }
    clear(key: string): void {
        localStorage.removeItem(key);
    }
}

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
    getItem(key: string): string | null {
        return sessionStorage.getItem(key);
    }
    setItem(key: string, data: string): void {
        sessionStorage.setItem(key, data);
    }
    clear(key: string): void {
        sessionStorage.removeItem(key);
    }
}
