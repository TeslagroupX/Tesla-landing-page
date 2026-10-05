import { Component, inject, signal } from '@angular/core';

import {
  COMPANY_LINKS,
  CONTACT,
  LEGAL_LINKS,
  LEGAL_NAME,
  SECTORS,
  SOCIAL,
  SOLUTIONS,
  SectorId,
  TAGLINE,
} from '../../content/landing.content';
import { LandingState } from '../../shared/landing-state';

interface FooterItem {
  readonly label: string;
  /** Sin `href`: texto. `null`: enlace sin destino todavía. */
  readonly href?: string | null;
  /** El filtro con el que se abren los casos al seguir el enlace. */
  readonly sector?: SectorId;
}

interface FooterColumn {
  readonly id: string;
  readonly title: string;
  readonly items: readonly FooterItem[];
}

@Component({
  selector: 'app-site-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class SiteFooter {
  protected readonly tagline = TAGLINE;
  protected readonly legalName = LEGAL_NAME;
  protected readonly legalLinks = LEGAL_LINKS;
  protected readonly social = SOCIAL;

  protected readonly columns: readonly FooterColumn[] = [
    {
      id: 'soluciones',
      title: 'Soluciones',
      items: SOLUTIONS.map((solution) => ({ label: solution.title, href: '#soluciones' })),
    },
    {
      id: 'sectores',
      title: 'Sectores',
      items: SECTORS.map((sector) => ({ label: sector.label, href: '#casos', sector: sector.id })),
    },
    { id: 'empresa', title: 'Empresa', items: COMPANY_LINKS },
    {
      id: 'sede',
      title: 'Sede',
      items: [
        { label: CONTACT.city },
        { label: CONTACT.address },
        { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
      ],
    },
  ];

  /** La columna desplegada en el acordeón de móvil. */
  protected readonly open = signal<string | null>(null);

  private readonly state = inject(LandingState);

  protected toggle(id: string): void {
    this.open.update((current) => (current === id ? null : id));
  }

  protected follow(item: FooterItem): void {
    if (item.sector) this.state.sector.set(item.sector);
  }
}
