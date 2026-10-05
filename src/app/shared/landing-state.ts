import { Injectable, signal } from '@angular/core';

import { SectorId } from '../content/landing.content';

/**
 * Lo que un bloque le dice a otro: el sector elegido en el hero o en el footer es el filtro con
 * el que se abre el carrusel de casos.
 */
@Injectable({ providedIn: 'root' })
export class LandingState {
  /** `null` = todos los sectores. */
  readonly sector = signal<SectorId | null>(null);
}
