import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, filter, map } from 'rxjs';

/** Lo que va pasando con un envío: cuánto se ha subido y, al final, el número de solicitud. */
export type SubmitEvent =
  | { readonly kind: 'progress'; readonly percent: number }
  | { readonly kind: 'done'; readonly requestNumber: string | null };

interface Receipt {
  readonly requestNumber?: string | null;
}

export const GENERIC_ERROR = 'No pudimos enviar su solicitud. Inténtelo de nuevo en unos minutos.';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  /**
   * Envía el formulario al proxy de la propia landing (`src/server.ts`), que lo reenvía a la
   * intranet. La URL es relativa a propósito: vale igual en `teslagroup.pe` y en `www`.
   */
  submit(data: FormData): Observable<SubmitEvent> {
    return this.http
      .post<Receipt>('/api/contact', data, { observe: 'events', reportProgress: true })
      .pipe(
        map((event): SubmitEvent | null => {
          if (event.type === HttpEventType.UploadProgress) {
            const percent = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
            return { kind: 'progress', percent };
          }
          if (event.type === HttpEventType.Response) {
            return { kind: 'done', requestNumber: event.body?.requestNumber ?? null };
          }
          return null;
        }),
        filter((event) => event !== null),
      );
  }
}

/**
 * El mensaje para la persona. El backend y el proxy responden `application/problem+json` con
 * `message` en español; cualquier otra cosa (sin red, una página de error de un proxy) cae en
 * el genérico.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body: unknown = error.error;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = (body as { message: unknown }).message;
      if (typeof message === 'string' && message.trim() !== '') return message;
    }
  }
  return GENERIC_ERROR;
}
