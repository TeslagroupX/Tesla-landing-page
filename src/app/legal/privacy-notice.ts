import NOTICE_SOURCE from './privacy-notice.md';

/**
 * El aviso de privacidad de clientes, prospectos, proveedores y visitantes del sitio.
 *
 * El texto vive en `privacy-notice.md`, que es lo que se revisa y lo que se pinta: el build lo
 * incrusta como cadena (`loader` de `angular.json`). La huella identifica ESE texto y no otro.
 * El formulario de contacto la envía con la versión, y la intranet guarda las dos con cada
 * solicitud: es la prueba de qué aviso aceptó la persona (DS 016-2024-JUS, art. 9).
 *
 * Cambiar una sola letra del texto cambia la huella, y la prueba de este archivo falla hasta
 * que se recalcula con `pnpm huella:aviso -- --write`. Un texto nuevo que ya se haya publicado
 * es una versión nueva: no se corrige el que alguien aceptó.
 */

/**
 * La forma canónica del texto, la que se pinta y la que se firma: saltos de línea LF y sin
 * espacios ni saltos al final. Así la huella no depende de cómo deje git los finales de línea
 * en cada máquina (`core.autocrlf` en Windows) ni de si el editor añade un salto al final.
 * `scripts/huella-aviso.mjs` aplica exactamente lo mismo.
 */
export function canonicalNoticeText(source: string): string {
  return source.replace(/\r\n?/g, '\n').trimEnd();
}

export const PRIVACY_NOTICE = {
  version: '1.0',
  /** Fecha de vigencia (Lima). No forma parte de la huella: la acompaña. */
  effectiveFrom: '2026-10-16',
  text: canonicalNoticeText(NOTICE_SOURCE),
  /** SHA-256 en hexadecimal de `text` en UTF-8. La genera `scripts/huella-aviso.mjs`. */
  sha256: '7f882af776edbeef7018703e1e82161b1fa9f81357d283c7c400147210e10d68',
} as const;

/** «15 de octubre de 2026»: la fecha larga, sin depender del huso del servidor. */
export function longDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
