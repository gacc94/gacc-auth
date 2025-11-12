import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'gacc-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
})
export class App {
  protected readonly title = signal('gacc-auth');
}
