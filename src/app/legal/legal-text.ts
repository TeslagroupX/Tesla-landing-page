import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Un trozo del texto: un título o un párrafo. */
export type LegalBlock =
  | { readonly kind: 'heading'; readonly text: string }
  | { readonly kind: 'paragraph'; readonly text: string };

/**
 * Parte el markdown mínimo del aviso en bloques.
 *
 * Solo entiende dos cosas —`## título` y párrafos separados por una línea en blanco— y todo lo
 * demás es texto. A propósito: el texto se pinta con la plantilla, escapado, y no con
 * `[innerHTML]`, así que no puede colar marcado, ni un enlace, ni una imagen que llame a otro
 * servidor. La única excepción son las direcciones de correo, que la plantilla vuelve `mailto:`
 * (ver `textFragments`). Es el mismo criterio que el texto de la política en la intranet.
 */
export function legalBlocks(text: string): readonly LegalBlock[] {
  const blocks: LegalBlock[] = [];
  let paragraph: string[] = [];

  const close = (): void => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      close();
    } else if (line.startsWith('## ')) {
      close();
      blocks.push({ kind: 'heading', text: line.slice(3).trim() });
    } else {
      paragraph.push(line);
    }
  }
  close();
  return blocks;
}

/** Un trozo de una línea: lo corriente o una dirección de correo. */
export interface TextFragment {
  readonly text: string;
  readonly email: boolean;
}

/** Una dirección de correo suelta en el texto; el punto final de la frase no cuenta. */
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

/**
 * Separa una línea en trozos para que las direcciones de correo se puedan pulsar. Es lo único
 * que se enlaza, y el enlace sale de lo que casó con el patrón (`mailto:` + la dirección), nunca
 * de marcado escrito en el texto.
 */
export function textFragments(text: string): readonly TextFragment[] {
  const fragments: TextFragment[] = [];
  let from = 0;
  for (const match of text.matchAll(EMAIL)) {
    if (match.index > from) fragments.push({ text: text.slice(from, match.index), email: false });
    fragments.push({ text: match[0], email: true });
    from = match.index + match[0].length;
  }
  if (from < text.length) fragments.push({ text: text.slice(from), email: false });
  return fragments;
}

/** Una sección: su título (si lo tiene) y lo que va debajo, hasta el siguiente título. */
export interface LegalSection {
  readonly blocks: readonly LegalBlock[];
  /** La sección «En resumen»: lo esencial en pocas líneas, separado del resto por una línea. */
  readonly summary: boolean;
}

const SUMMARY_TITLE = 'en resumen';

/** Agrupa los bloques por sección. Lo que hay antes del primer título es una sección sin él. */
export function legalSections(text: string): readonly LegalSection[] {
  const sections: LegalBlock[][] = [];
  for (const block of legalBlocks(text)) {
    if (block.kind === 'heading' || sections.length === 0) sections.push([]);
    sections[sections.length - 1].push(block);
  }
  return sections.map((blocks) => {
    const first = blocks[0];
    return {
      blocks,
      summary: first.kind === 'heading' && first.text.trim().toLowerCase() === SUMMARY_TITLE,
    };
  });
}

/** Pinta un texto legal en markdown mínimo: títulos, párrafos y correos pulsables. */
@Component({
  selector: 'app-legal-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (section of sections(); track $index) {
      <section class="lt__section" [class.lt__summary]="section.summary">
        @for (block of section.blocks; track $index) {
          @if (block.kind === 'heading') {
            <h2 class="lt__heading">{{ block.text }}</h2>
          } @else {
            <p class="lt__paragraph">
              @for (fragment of fragments(block.text); track $index) {
                @if (fragment.email) {
                  <a [href]="'mailto:' + fragment.text">{{ fragment.text }}</a>
                } @else {
                  <span>{{ fragment.text }}</span>
                }
              }
            </p>
          }
        }
      </section>
    }
  `,
  styleUrl: './legal-text.scss',
})
export class LegalText {
  readonly text = input.required<string>();

  protected readonly sections = computed(() => legalSections(this.text()));
  protected readonly fragments = textFragments;
}
