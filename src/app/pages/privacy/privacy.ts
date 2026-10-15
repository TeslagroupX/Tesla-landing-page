import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LegalText } from '../../legal/legal-text';
import { PRIVACY_NOTICE, longDate } from '../../legal/privacy-notice';
import { LegalPage } from '../../shared/legal-page/legal-page';

/**
 * `/privacidad`: el aviso de privacidad, el mismo texto cuya huella acompaña cada envío del
 * formulario de contacto. Se prerenderiza: es HTML estático y se lee sin JavaScript.
 */
@Component({
  selector: 'app-privacy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalPage, LegalText],
  template: `
    <app-legal-page
      heading="Aviso de privacidad"
      lead="Para las personas de contacto de clientes, prospectos y proveedores, y para quienes escriben por este sitio web."
      [meta]="meta"
    >
      <app-legal-text [text]="notice.text" />
    </app-legal-page>
  `,
})
export class Privacy {
  protected readonly notice = PRIVACY_NOTICE;
  protected readonly meta = `Versión ${PRIVACY_NOTICE.version} · Vigente desde el ${longDate(
    PRIVACY_NOTICE.effectiveFrom,
  )}`;
}
