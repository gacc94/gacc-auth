import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'gacc-sign-in',
    imports: [MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
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
                    <button matButton="tonal" class="sign-in__button" color="primary" type="submit">Sign In</button>
                </form>
            </section>
        </main>
    `,
    styleUrl: './sign-in.scss',
})
export default class SignIn {
    form = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
    });

    onSubmit() {
        console.log('Sign In', this.form.value);
    }
}
