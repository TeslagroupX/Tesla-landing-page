import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LEGAL_PAGES } from '../../shared/legal-page/legal-page';

/** `/`: la página «en construcción», con el contacto y, al pie, las páginas legales. */
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly legalPages = LEGAL_PAGES;
}
