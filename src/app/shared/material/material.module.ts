import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [],
    imports: [CommonModule],
    exports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
    providers: [],
})
export class MaterialModule {
    constructor() {}
}
