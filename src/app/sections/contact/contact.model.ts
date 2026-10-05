import { SECTORS, SOLUTIONS } from '../../content/landing.content';

/**
 * Las reglas y los códigos del formulario. Son los mismos que valida el backend
 * (`POST /api/v1/public/contact-requests`): cambiar uno aquí exige cambiarlo allí.
 */

export interface Option {
  readonly id: string;
  readonly label: string;
}

export const SECTOR_OPTIONS: readonly Option[] = [...SECTORS, { id: 'otro', label: 'Otro' }];

export const SOLUTION_OPTIONS: readonly Option[] = [
  ...SOLUTIONS.map(({ id, title }) => ({ id, label: title })),
  { id: 'por_definir', label: 'Aún no lo sé' },
];

export const RULES = {
  name: { min: 2, max: 200 },
  company: { min: 2, max: 200 },
  email: { max: 200 },
  phone: { min: 6, max: 40 },
  description: { min: 10, max: 4000 },
  attachment: { maxBytes: 25 * 1024 * 1024, extensions: ['pdf', 'dwg'] },
} as const;

export const PHONE_PATTERN = /^[0-9+()\- ]+$/;

/**
 * Letras sin tilde, cifras y los signos habituales. Más estrecho que lo que admite la norma, a
 * propósito: esa dirección acaba en un enlace `mailto:` del correo de aviso, y ahí un `?` o un
 * `&` ya no serían parte de la dirección.
 */
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export interface ContactRequest {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly phone: string;
  readonly sector: string;
  readonly solution: string;
  readonly description: string;
  readonly consent: boolean;
  /** Campo trampa: una persona no lo ve y lo deja vacío. */
  readonly website: string;
}

/** Por qué no se acepta un archivo, o `null` si sirve. */
export function attachmentProblem(file: File): string | null {
  const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  if (!(RULES.attachment.extensions as readonly string[]).includes(extension)) {
    return 'Solo se aceptan archivos PDF o DWG.';
  }
  if (file.size === 0) {
    return 'El archivo está vacío.';
  }
  if (file.size > RULES.attachment.maxBytes) {
    return `El archivo pesa ${formatBytes(file.size)} y el máximo son 25 MB.`;
  }
  return null;
}

/** «840 KB», «3.2 MB»: con punto decimal, como en es-PE. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function toFormData(request: ContactRequest, attachment: File | null): FormData {
  const data = new FormData();
  data.set('name', request.name.trim());
  data.set('company', request.company.trim());
  data.set('email', request.email.trim());
  data.set('phone', request.phone.trim());
  data.set('sector', request.sector);
  data.set('solution', request.solution);
  data.set('description', request.description.trim());
  data.set('consent', String(request.consent));
  data.set('website', request.website);
  if (attachment) data.set('attachment', attachment, attachment.name);
  return data;
}
