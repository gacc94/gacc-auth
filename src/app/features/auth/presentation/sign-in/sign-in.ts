import { Component, inject, linkedSignal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@shared/material/material.module';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthStore } from '@features/auth/infrastructure/stores/auth.store';
import { CommonModule } from '@angular/common';

const GOOGLE_SVG = `
<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#4285F4" d="M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z"></path><path fill="#34A853" d="M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z"></path><path fill="#FBBC04" d="M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z"></path><path fill="#EA4335" d="M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z"></path></g></svg>
`;

@Component({
    selector: 'gacc-sign-in',
    imports: [ReactiveFormsModule, MaterialModule, CommonModule],
    template: `
        <main class="sign-in">
            <section class="sign-in__section">
                <h1 class="sign-in__title">Sign In</h1>
                <form class="sign-in__form" (ngSubmit)="onSubmit()" [formGroup]="form">
                    <mat-form-field class="sign-in__field" appearance="outline">
                        <mat-label>Username</mat-label>
                        <input matInput class="sign-in__input" formControlName="username" />
                    </mat-form-field>
                    <mat-form-field class="sign-in__field" appearance="outline">
                        <mat-label>Password</mat-label>
                        <input matInput class="sign-in__input" type="password" formControlName="password" />
                    </mat-form-field>
                    <div class="sign-in__actions">
                        <button matButton="elevated" class="sign-in__button" color="primary" type="submit">Sign In</button>

                        <button matFab color="primary" type="button" (click)="signInWithGoogle()">
                            <mat-icon svgIcon="google-svg"></mat-icon>
                        </button>
                    </div>
                </form>
                <pre><code>{{ store.user() | json }}</code></pre>
            </section>
        </main>
    `,
    styleUrl: './sign-in.scss',
    providers: [AuthStore],
})
export default class SignIn {
    readonly #iconRegistry = inject(MatIconRegistry);
    readonly #sanitizer = inject(DomSanitizer);
    readonly store = inject(AuthStore);

    constructor() {
        this.#iconRegistry.addSvgIconLiteral('google-svg', this.#sanitizer.bypassSecurityTrustHtml(GOOGLE_SVG));
    }

    form = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
    });

    onSubmit() {
        console.log('Sign In', this.form.value);
    }

    signInWithGoogle() {
        this.store.signIn();
    }

    ngOnInit() {
        console.log('ngOnInit');
        // this.store.signIn();
    }
}
