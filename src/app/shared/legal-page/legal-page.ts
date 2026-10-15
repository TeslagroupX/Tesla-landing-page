import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Las páginas legales, en el orden en que se enlazan entre sí. */
export const LEGAL_PAGES = [
  { label: 'Aviso de privacidad', path: '/privacidad' },
  { label: 'Cookies', path: '/cookies' },
  { label: 'Libro de Reclamaciones', path: '/libro-de-reclamaciones' },
] as const;

/**
 * El marco de las páginas legales: título, una línea de datos (versión, fecha) y el texto,
 * con los enlaces a las otras páginas legales al pie.
 */
@Component({
  selector: 'app-legal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
})
export class LegalPage {
  readonly heading = input.required<string>();
  readonly lead = input<string | null>(null);
  readonly meta = input<string | null>(null);

  protected readonly pages = LEGAL_PAGES;
}
