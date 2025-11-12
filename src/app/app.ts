import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'gacc-root',
  imports: [RouterOutlet, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `<router-outlet />`,
})
export class App {
  protected readonly title = signal('gacc-auth');
}
