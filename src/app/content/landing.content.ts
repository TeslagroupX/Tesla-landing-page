/**
 * Todo el texto y los datos de la landing, en un solo sitio.
 *
 * Lo que aún no está confirmado se marca aquí y la interfaz lo enseña como pendiente: un `href`
 * en `null` es un enlace visible pero deshabilitado, y un valor en `null` se pinta con su
 * marcador entre corchetes. Completar un dato aquí lo activa en la página.
 */

export type SectorId = 'mineria' | 'petroleo_gas' | 'agroindustria' | 'pesca';
export type SolutionId = 'redes_automatizacion' | 'power_system' | 'energy_management';
export type SectionId = 'inicio' | 'soluciones' | 'sectores' | 'casos' | 'tecnologia' | 'contacto';

export interface LinkItem {
  readonly label: string;
  /** `null`: destino sin definir todavía. */
  readonly href: string | null;
}

export interface NavItem extends LinkItem {
  /** La sección que marca este enlace como activo al pasar por ella. */
  readonly section?: SectionId;
}

export const NAV: readonly NavItem[] = [
  { label: 'Soluciones', href: '#soluciones', section: 'soluciones' },
  { label: 'Sectores', href: '#sectores', section: 'sectores' },
  { label: 'Proyectos', href: '#casos', section: 'casos' },
  { label: 'Tecnología', href: '#tecnologia', section: 'tecnologia' },
  { label: 'Nosotros', href: null },
  { label: 'Contacto', href: '#contacto', section: 'contacto' },
];

/** El orden en que aparecen en la página; el header las observa para marcar la activa. */
export const SECTION_IDS: readonly SectionId[] = [
  'inicio',
  'soluciones',
  'sectores',
  'casos',
  'tecnologia',
  'contacto',
];

export interface Sector {
  readonly id: SectorId;
  readonly label: string;
}

export const SECTORS: readonly Sector[] = [
  { id: 'mineria', label: 'Minería' },
  { id: 'petroleo_gas', label: 'Petróleo y gas' },
  { id: 'agroindustria', label: 'Agroindustria' },
  { id: 'pesca', label: 'Pesca' },
];

export const HERO = {
  eyebrow: 'Integración industrial · Perú',
  title: 'Integración industrial para operaciones que no pueden detenerse.',
  lead: 'Ingeniería, automatización y tableros eléctricos para minería, petróleo y gas, agroindustria y pesca.',
  media: 'Video o foto principal · planta en operación',
  poster: null as string | null,
  /** Sin video todavía: el botón de pausa (WCAG 2.2.2) queda deshabilitado. */
  video: null as string | null,
} as const;

export interface Solution {
  readonly id: SolutionId;
  readonly number: string;
  readonly title: string;
  readonly summary: string;
  readonly media: string;
  readonly href: string | null;
}

export const SOLUTIONS: readonly Solution[] = [
  {
    id: 'redes_automatizacion',
    number: '01',
    title: 'Networks and Industrial Automation',
    summary: 'Redes industriales, PLC, SCADA e instrumentación.',
    media: 'Foto · sala de control y redes',
    href: null,
  },
  {
    id: 'power_system',
    number: '02',
    title: 'Power System',
    summary: 'Tableros eléctricos de fuerza, control y distribución.',
    media: 'Foto · tableros de fuerza en planta',
    href: null,
  },
  {
    id: 'energy_management',
    number: '03',
    title: 'Energy Management',
    summary: 'Monitoreo de consumo, calidad de energía y eficiencia.',
    media: 'Foto · medición y monitoreo de energía',
    href: null,
  },
];

export interface Metric {
  /** `null`: cifra por confirmar; se pinta `placeholder`. */
  readonly value: number | null;
  readonly prefix?: string;
  readonly placeholder?: string;
  readonly label: string;
}

export const METRICS: readonly Metric[] = [
  { value: 10, prefix: '+', label: 'Años desde 2014' },
  { value: null, placeholder: '[000]+', label: 'Proyectos ejecutados' },
  { value: 4, label: 'Sectores industriales' },
];

/** Solo nombres: los logos y el permiso de uso de cada marca están por confirmar. */
export const PARTNERS: readonly string[] = [
  'Schneider',
  'Rockwell',
  'Endress+Hauser',
  'AVEVA',
  'Rittal',
  'Festo',
];

export interface CaseStudy {
  readonly sector: SectorId;
  /** `null`: región por confirmar. */
  readonly region: string | null;
  readonly title: string;
  /** `null`: resultado medible por confirmar. */
  readonly result: string | null;
}

export const CASES: readonly CaseStudy[] = [
  {
    sector: 'agroindustria',
    region: 'La Libertad',
    title: 'Automatización de línea de proceso con PLC y SCADA',
    result: null,
  },
  {
    sector: 'pesca',
    region: 'Áncash',
    title: 'Tableros de fuerza y control para planta de harina',
    result: null,
  },
  {
    sector: 'mineria',
    region: null,
    title: 'Instrumentación y control de planta concentradora',
    result: null,
  },
];

export interface TechStep {
  readonly number: string;
  readonly title: string;
  readonly text: string;
  readonly media: string;
}

export const TECH_STEPS: readonly TechStep[] = [
  {
    number: '01',
    title: 'Diagnóstico en planta',
    text: 'Levantamiento de procesos y necesidades con el usuario.',
    media: 'Foto · levantamiento en planta',
  },
  {
    number: '02',
    title: 'Ingeniería y simulación',
    text: 'Ingeniería básica y de detalle validada antes de fabricar.',
    media: 'Imagen · ingeniería de detalle',
  },
  {
    number: '03',
    title: 'Integración y puesta en marcha',
    text: 'Montaje, pruebas y comisionamiento.',
    media: 'Foto · montaje y pruebas',
  },
  {
    number: '04',
    title: 'Digitalización, eficiencia y soporte',
    text: 'Monitoreo, capacitación y postventa.',
    media: 'Imagen · tablero de monitoreo',
  },
];

export const CONTACT = {
  email: 'proyectos@teslagroup.pe',
  /** `null`: teléfono por confirmar. */
  phone: null as string | null,
  phonePlaceholder: '[+51 000 000 000]',
  /** `null`: plazo de respuesta por confirmar. */
  responseHours: null as number | null,
  responseHoursPlaceholder: '[24]',
  city: 'Trujillo',
  address: 'Av. San José 788, Miramar',
} as const;

export const SOCIAL = {
  facebook: 'https://www.facebook.com/TeslaGroupPeru',
  linkedin: 'https://www.linkedin.com/company/teslagroup/',
} as const;

export const COMPANY_LINKS: readonly LinkItem[] = [
  { label: 'Nosotros', href: null },
  { label: 'Proyectos', href: '#casos' },
  { label: 'Sustentabilidad', href: null },
  { label: 'Trabaja con nosotros', href: null },
];

export const LEGAL_LINKS: readonly LinkItem[] = [
  { label: 'Privacidad', href: null },
  { label: 'Términos', href: null },
  { label: 'Cookies', href: null },
  { label: 'Libro de Reclamaciones', href: null },
];

export const LEGAL_NAME = '© 2026 Power Energy & Automation S.A.C. (Tesla Group) · RUC 20559998649';
export const TAGLINE =
  'Integración industrial en ingeniería, automatización y tableros eléctricos.';
