import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LegalText } from '../../legal/legal-text';
import { longDate } from '../../legal/privacy-notice';
import { LegalPage } from '../../shared/legal-page/legal-page';

/** Cuándo se revisó por última vez lo que el sitio guarda en el navegador. */
export const COOKIES_REVIEWED = '2026-10-15';

/**
 * Lo que el sitio guarda en el navegador, que hoy es nada propio.
 *
 * Revisado contra el código y el despliegue: la aplicación no escribe cookies ni usa
 * `localStorage`, `sessionStorage` ni IndexedDB, y no carga analítica ni publicidad. Lo único
 * que puede dejar una cookie es Cloudflare, que está delante del sitio, y solo cuando sus
 * protecciones contra bots o un desafío lo piden. Las fuentes de Google (`index.html`) no
 * dejan cookies, pero Google recibe la IP: se dice. Si algo de esto cambia (una herramienta de
 * medición, un chat), esta página cambia con ello y, si la cookie no es técnica, hay que pedir
 * consentimiento ANTES de instalarla.
 */
export const COOKIES_TEXT = `## En resumen

Este sitio no instala cookies propias ni guarda información en el almacenamiento de su navegador. No usa cookies de publicidad ni de analítica, ni herramientas de medición de audiencia. Por eso no le pide que acepte cookies al entrar.

## Cookies de seguridad de Cloudflare

El sitio se sirve a través de Cloudflare, que lo protege frente a ataques y tráfico automatizado. Cuando sus protecciones lo requieren, Cloudflare puede instalar una cookie técnica propia, como __cf_bm o cf_clearance, para distinguir a una persona de un programa automatizado. Son cookies estrictamente necesarias para la seguridad del sitio, no sirven para seguir su navegación por otros sitios y caducan en poco tiempo.

## Tipografías

Las tipografías del sitio se descargan de Google Fonts. Esa descarga no instala cookies, pero los servidores de Google reciben la dirección IP y los datos técnicos del navegador, como ocurre con cualquier recurso que se carga desde otro servidor.

## Cómo gestionarlas

Puede bloquear o borrar las cookies desde la configuración de su navegador. El sitio seguirá funcionando, aunque Cloudflare podría pedirle una verificación adicional.

## Cambios

Si el sitio incorpora en el futuro cookies que no sean técnicas, se le pedirá su consentimiento antes de instalarlas y se actualizará esta página. El tratamiento de los datos personales se explica en el aviso de privacidad.`;

/** `/cookies`. */
@Component({
  selector: 'app-cookies',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalPage, LegalText],
  template: `
    <app-legal-page heading="Cookies" [meta]="meta">
      <app-legal-text [text]="text" />
    </app-legal-page>
  `,
})
export class Cookies {
  protected readonly text = COOKIES_TEXT;
  protected readonly meta = `Actualizado el ${longDate(COOKIES_REVIEWED)}`;
}
