/**
 * Lo que el proxy del formulario decide antes de reenviar nada: qué peticiones no pasan, de
 * quién dice que vienen y qué cabeceras le llegan al backend.
 *
 * Sin dependencias de Node ni de Express, para poder probarlo con las mismas pruebas que el
 * resto de la landing.
 */

/** Un adjunto de 25 MB más los campos y los separadores del multipart. */
export const MAX_BODY_BYTES = 26 * 1024 * 1024;

/** Envíos a la vez. El contenedor de producción tiene 384 MB y cada envío ocupa un socket. */
export const MAX_CONCURRENT = 4;

export const UPSTREAM_TIMEOUT_MS = 120_000;

export type Headers = Readonly<Record<string, string | string[] | undefined>>;

export interface Rejection {
  readonly status: number;
  readonly message: string;
  /** Segundos para la cabecera `Retry-After`. */
  readonly retryAfter?: number;
}

/** IPv4 o IPv6 en texto. Lo demás no se le pasa al backend como dirección. */
const ADDRESS = /^[0-9A-Fa-f:.]{2,45}$/;

export function header(headers: Headers, name: string): string | undefined {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

/** Por qué no se reenvía la petición, o `null` si pasa. */
export function rejection(headers: Headers, inFlight: number): Rejection | null {
  const contentType = header(headers, 'content-type') ?? '';
  if (!contentType.trim().toLowerCase().startsWith('multipart/form-data')) {
    return { status: 415, message: 'El formulario no llegó en el formato esperado.' };
  }

  if (!sameOrigin(headers)) {
    return { status: 403, message: 'El formulario solo se puede enviar desde este sitio.' };
  }

  const declared = header(headers, 'content-length');
  if (declared === undefined || !/^\d+$/.test(declared)) {
    return { status: 411, message: 'La petición no dice cuánto pesa.' };
  }
  if (Number(declared) > MAX_BODY_BYTES) {
    return { status: 413, message: 'El archivo adjunto supera el máximo de 25 MB.' };
  }

  if (inFlight >= MAX_CONCURRENT) {
    return {
      status: 503,
      message: 'Estamos recibiendo varias solicitudes a la vez. Inténtelo de nuevo en un momento.',
      retryAfter: 5,
    };
  }

  return null;
}

/**
 * Un formulario de otro sitio no puede enviar en nombre de quien lo visita. El navegador dice
 * de dónde sale la petición (`Sec-Fetch-Site`, y antes `Origin`); quien no manda ninguna de las
 * dos no es un navegador, y a ése lo frenan los topes del backend, no esto.
 */
function sameOrigin(headers: Headers): boolean {
  const site = header(headers, 'sec-fetch-site');
  if (site !== undefined) return site === 'same-origin';

  const origin = header(headers, 'origin');
  if (origin === undefined) return true;
  try {
    return new URL(origin).host === header(headers, 'host');
  } catch {
    return false;
  }
}

/**
 * La IP de quien visita. En producción a la landing solo llega el túnel de Cloudflare, que
 * escribe siempre `CF-Connecting-IP`; en local no viene y vale la del socket.
 */
export function clientIp(headers: Headers, remoteAddress: string | undefined): string {
  const fromEdge = header(headers, 'cf-connecting-ip')?.trim();
  if (fromEdge && ADDRESS.test(fromEdge)) return fromEdge;

  const fromSocket = remoteAddress?.replace(/^::ffff:/, '') ?? '';
  return ADDRESS.test(fromSocket) ? fromSocket : '';
}

/**
 * Lo único que se reenvía. Ni cookies, ni `Origin`, ni `Authorization`: nada de lo que mande el
 * navegador puede hacerse pasar por una sesión de la intranet.
 *
 * La IP va en las dos cabeceras: el nginx de `tg-frontend` lee `CF-Connecting-IP` y el backend,
 * cuando se le habla directo en local, `X-Forwarded-For`.
 */
export function forwardHeaders(headers: Headers, ip: string): Record<string, string> {
  const forwarded: Record<string, string> = {
    'content-type': header(headers, 'content-type') ?? '',
    'content-length': header(headers, 'content-length') ?? '0',
    accept: 'application/json',
  };

  const userAgent = header(headers, 'user-agent');
  if (userAgent) forwarded['user-agent'] = userAgent.slice(0, 400);
  if (ip) {
    forwarded['cf-connecting-ip'] = ip;
    forwarded['x-forwarded-for'] = ip;
  }
  return forwarded;
}

/** El cuerpo de un error, con las mismas claves que usa el backend (RFC 9457 + `message`). */
export function problem(status: number, message: string): Record<string, unknown> {
  return { type: 'about:blank', status, detail: message, message };
}
