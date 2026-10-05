import { Component, input } from '@angular/core';

/**
 * El hueco de una foto o un video. Con `src` pinta la imagen; sin él, la textura del wireframe
 * con un rótulo que dice qué va ahí. El tamaño lo decide quien lo usa.
 */
@Component({
  selector: 'app-media-slot',
  templateUrl: './media-slot.html',
  styleUrl: './media-slot.scss',
  host: {
    '[class.media-slot--light]': "tone() === 'light'",
    '[class.media-slot--top]': "labelAt() !== 'center'",
    '[class.media-slot--end]': "labelAt() === 'top-end'",
  },
})
export class MediaSlot {
  /** Qué imagen falta. Es también el texto alternativo cuando ya hay imagen. */
  readonly label = input.required<string>();
  readonly src = input<string | null>(null);
  readonly tone = input<'dark' | 'light'>('dark');
  /** Dónde va el rótulo: centrado, o arriba (a un lado u otro) cuando hay texto encima. */
  readonly labelAt = input<'center' | 'top' | 'top-end'>('center');
}
