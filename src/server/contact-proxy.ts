import type { Request, Response } from 'express';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

import {
  UPSTREAM_TIMEOUT_MS,
  clientIp,
  forwardHeaders,
  problem,
  rejection,
} from './contact-guards';

const UNAVAILABLE =
  'El envío en línea no está disponible por ahora. Escríbanos a proyectos@teslagroup.pe.';
const UPSTREAM_FAILED =
  'No pudimos enviar su solicitud en este momento. Inténtelo de nuevo en unos minutos.';

/**
 * El formulario de contacto, reenviado a la intranet.
 *
 * La landing no guarda ni interpreta nada: pasa el cuerpo tal cual, EN STREAMING —un adjunto
 * puede pesar 25 MB y este proceso tiene poca memoria—, y devuelve la respuesta del backend.
 * Validar, limitar por IP, guardar y avisar por correo es cosa suya.
 *
 * Es un proxy y no una llamada directa del navegador porque el backend solo se publica en el
 * dominio de la intranet, con un CORS pensado para ella. Aquí la petición es al mismo origen.
 *
 * @param target La dirección del endpoint (`CONTACT_API_URL`). Sin ella todo responde 503: la
 *   landing se puede desplegar antes que el backend, y el formulario ofrece el correo.
 */
export function contactProxy(target: string | undefined): (req: Request, res: Response) => void {
  const url = parse(target);
  let inFlight = 0;

  return (req, res) => {
    if (!url) {
      send(res, 503, UNAVAILABLE);
      return;
    }

    const rejected = rejection(req.headers, inFlight);
    if (rejected) {
      if (rejected.retryAfter) res.setHeader('Retry-After', String(rejected.retryAfter));
      send(res, rejected.status, rejected.message);
      return;
    }

    inFlight++;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      inFlight--;
    };

    // Si el backend contesta antes de recibir todo (un 429, un 413), se deja de reenviar y lo
    // que falte de la subida se lee y se tira: cortar la conexión a media subida le llegaría
    // al navegador como un fallo de red y no como la respuesta.
    const stopForwarding = () => {
      req.unpipe(upstream);
      req.resume();
    };

    const request = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const upstream = request(
      url,
      {
        method: 'POST',
        headers: forwardHeaders(req.headers, clientIp(req.headers, req.socket.remoteAddress)),
        timeout: UPSTREAM_TIMEOUT_MS,
      },
      (answer) => {
        res.status(answer.statusCode ?? 502);
        res.setHeader('Cache-Control', 'no-store');
        for (const name of ['content-type', 'retry-after'] as const) {
          const value = answer.headers[name];
          if (value) res.setHeader(name, value);
        }
        answer.pipe(res);
        answer.on('end', () => {
          if (!upstream.writableEnded) upstream.destroy();
        });
        stopForwarding();
      },
    );

    upstream.on('timeout', () => upstream.destroy(new Error('timeout')));
    upstream.on('error', (error) => {
      release();
      // Sin datos de la solicitud: solo qué falló al hablar con el backend.
      console.warn(`[contacto] el backend no respondió: ${error.message}`);
      if (res.headersSent) {
        res.destroy();
        return;
      }
      stopForwarding();
      send(res, error.message === 'timeout' ? 504 : 502, UPSTREAM_FAILED);
    });
    upstream.on('close', release);

    // Quien visita cerró a medias: no hay a quién contestar.
    res.on('close', () => {
      if (!res.writableEnded) upstream.destroy();
    });

    req.pipe(upstream);
  };
}

function send(res: Response, status: number, message: string): void {
  res
    .status(status)
    .set({ 'Content-Type': 'application/problem+json', 'Cache-Control': 'no-store' })
    .send(JSON.stringify(problem(status, message)));
}

function parse(target: string | undefined): URL | null {
  if (!target?.trim()) return null;
  try {
    const url = new URL(target.trim());
    if (url.protocol === 'http:' || url.protocol === 'https:') return url;
  } catch {
    // Cae al aviso de abajo.
  }
  console.warn(
    '[contacto] CONTACT_API_URL no es una dirección http(s) válida: el envío queda apagado',
  );
  return null;
}
