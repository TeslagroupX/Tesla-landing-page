import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { TECH_STEPS } from '../../content/landing.content';
import { MediaSlot } from '../../shared/media-slot/media-slot';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-technology',
  imports: [MediaSlot, Reveal],
  templateUrl: './technology.html',
  styleUrl: './technology.scss',
})
export class Technology {
  protected readonly steps = TECH_STEPS;

  /** El paso que cruza la mitad de la pantalla. */
  protected readonly active = signal(0);
  /** Cuánto de la lista de pasos ha pasado ya por la mitad de la pantalla, de 0 a 1. */
  protected readonly progress = signal(0);

  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const list = this.list().nativeElement;
      let queued = false;

      const update = () => {
        queued = false;
        const middle = window.innerHeight / 2;
        const box = list.getBoundingClientRect();
        if (box.height === 0) return;

        this.progress.set(Math.min(1, Math.max(0, (middle - box.top) / box.height)));

        let active = 0;
        Array.from(list.children).forEach((step, index) => {
          if (step.getBoundingClientRect().top <= middle) active = index;
        });
        this.active.set(active);
      };
      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
      };

      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });
    });
  }
}
