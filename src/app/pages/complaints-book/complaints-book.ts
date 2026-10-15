import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LegalText } from '../../legal/legal-text';
import { LegalPage } from '../../shared/legal-page/legal-page';

/**
 * El Libro de Reclamaciones de la empresa es FÍSICO, en sus oficinas: esta página lo dice y no
 * simula uno virtual que no existe. Publicar un libro virtual exige antes modificar la
 * inscripción del banco Quejas y reclamos (hoy declarado sin transferencias) y la política.
 */
export const COMPLAINTS_BOOK_TEXT = `POWER ENERGY & AUTOMATION S.A.C., que opera con el nombre comercial TESLA GROUP, con RUC 20559998649, pone a disposición de sus clientes un Libro de Reclamaciones físico en sus oficinas, conforme al Código de Protección y Defensa del Consumidor.

Para registrar una queja o un reclamo, puede solicitarlo en nuestras oficinas. La sede principal está en Av. San José N.° 788, Miramar – Ex Alto Moche, Moche, Trujillo, La Libertad. Por ahora el libro no está disponible en este sitio web.

Los datos que se anotan en el libro se incorporan al banco de datos personales Quejas y reclamos (código PJ-2026-5364), inscrito ante la Autoridad Nacional de Protección de Datos Personales, y se usan solo para atender la queja o el reclamo.`;

/** `/libro-de-reclamaciones`. */
@Component({
  selector: 'app-complaints-book',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalPage, LegalText],
  template: `
    <app-legal-page heading="Libro de Reclamaciones">
      <app-legal-text [text]="text" />
    </app-legal-page>
  `,
})
export class ComplaintsBook {
  protected readonly text = COMPLAINTS_BOOK_TEXT;
}
