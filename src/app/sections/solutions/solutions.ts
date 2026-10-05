import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { SOLUTIONS } from '../../content/landing.content';
import { MediaSlot } from '../../shared/media-slot/media-slot';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-solutions',
  imports: [MediaSlot, Reveal],
  templateUrl: './solutions.html',
  styleUrl: './solutions.scss',
})
export class Solutions {
  protected readonly solutions = SOLUTIONS;

  /** El panel expandido en desktop; `null` = los tres iguales. */
  protected readonly open = signal<number | null>(null);
  /** La card a la vista en el carrusel de móvil. */
  protected readonly current = signal(0);

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const track = this.track().nativeElement;
      let queued = false;

      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          const step = track.scrollWidth / this.solutions.length;
          this.current.set(
            Math.min(this.solutions.length - 1, Math.round(track.scrollLeft / step)),
          );
        });
      };
      track.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => track.removeEventListener('scroll', onScroll));
    });
  }

  protected goTo(index: number): void {
    const panel = this.track().nativeElement.children[index] as HTMLElement | undefined;
    panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  protected closeIfLeft(event: FocusEvent, panel: HTMLElement): void {
    if (!panel.contains(event.relatedTarget as Node | null)) this.open.set(null);
  }
}
