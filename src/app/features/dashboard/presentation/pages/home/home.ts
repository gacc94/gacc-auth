import { Component, inject } from '@angular/core';
import { MaterialModule } from '@shared/material/material.module';
import { AuthStore } from '@features/auth/infrastructure/stores/auth.store';

@Component({
    selector: 'gacc-home',
    imports: [MaterialModule],
    template: `
        <mat-toolbar color="primary" class="mat-elevation-z4">
            <span>Home</span>
            <button matButton="filled" (click)="store.signOut()">Sign Out</button>
        </mat-toolbar>
        <pre><code>{{ store.user() | json }}</code></pre>

        <button matButton="filled" (click)="store.signOut()">Clear storage</button>
    `,
    styleUrl: './home.scss',
    // providers: [AuthStore],
})
export default class Home {
    readonly store = inject(AuthStore);
}
