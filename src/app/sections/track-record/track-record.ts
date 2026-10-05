import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { METRICS, PARTNERS } from '../../content/landing.content';
import { Reveal } from '../../shared/reveal';

const COUNT_UP_MS = 1200;

@Component({
  selector: 'app-track-record',
  imports: [Reveal],
  templateUrl: './track-record.html',
  styleUrl: './track-record.scss',
})
export class TrackRecord {
  protected readonly metrics = METRICS;
  protected readonly partners = PARTNERS;

  /**
   * Lo que se pinta de cada cifra. Arranca en el valor final: es lo que lleva el HTML
   * prerenderizado y lo que ve quien no tiene JavaScript o prefiere menos movimiento.
   */
  protected readonly shown = signal(METRICS.map((metric) => metric.value));

  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      if (
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      let armed = false;
      let frame = 0;
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          if (!entry.isIntersecting) {
            // Fuera de la vista se puede poner a cero sin que nadie lo vea saltar.
            if (!armed) {
              armed = true;
              this.paint(0);
            }
            return;
          }
          observer.disconnect();
          if (!armed) return;

          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = Math.min(1, (now - start) / COUNT_UP_MS);
            this.paint(1 - Math.pow(1 - elapsed, 3));
            if (elapsed < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        },
        { threshold: 0.4 },
      );
      observer.observe(this.list().nativeElement);

      destroyRef.onDestroy(() => {
        observer.disconnect();
        cancelAnimationFrame(frame);
      });
    });
  }

  private paint(fraction: number): void {
    this.shown.set(
      METRICS.map((metric) => (metric.value === null ? null : Math.round(metric.value * fraction))),
    );
  }
}
