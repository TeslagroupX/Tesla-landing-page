import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** El marco: cada ruta (`app.routes.ts`) pinta su página entera. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
