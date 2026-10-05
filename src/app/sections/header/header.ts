import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { NAV, SECTION_IDS, SOLUTIONS, SectionId } from '../../content/landing.content';
import { MediaSlot } from '../../shared/media-slot/media-slot';
import { NavDrawer } from './nav-drawer/nav-drawer';

/** Desde cuántos píxeles de scroll el header deja de ser transparente. */
const SOLID_AFTER = 80;
/** Por debajo de esto nunca se oculta: se quedaría sin header a media altura del hero. */
const HIDE_AFTER = 480;
/** Cuánto hay que moverse para que cuente como cambio de dirección. */
const DIRECTION_THRESHOLD = 8;

@Component({
  selector: 'app-site-header',
  imports: [MediaSlot, NavDrawer],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class SiteHeader {
  protected readonly nav = NAV;
  protected readonly solutions = SOLUTIONS;

  protected readonly solid = signal(false);
  protected readonly hidden = signal(false);
  protected readonly active = signal<SectionId | null>(null);
  protected readonly megaOpen = signal(false);
  protected readonly drawerOpen = signal(false);

  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');
  private readonly toggle = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      let lastY = window.scrollY;
      let queued = false;

      const update = () => {
        queued = false;
        const y = window.scrollY;
        this.solid.set(y > SOLID_AFTER);

        if (y < HIDE_AFTER || y < lastY - DIRECTION_THRESHOLD) {
          this.hidden.set(false);
        } else if (y > lastY + DIRECTION_THRESHOLD && !this.mustStayVisible()) {
          this.hidden.set(true);
        }
        if (Math.abs(y - lastY) > DIRECTION_THRESHOLD) lastY = y;
      };
      const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
      };

      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

      if (typeof IntersectionObserver === 'undefined') return;
      // Una línea a media pantalla: la sección que la cruza es la activa.
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) this.active.set(entry.target.id as SectionId);
          }
        },
        { rootMargin: '-50% 0px -50% 0px' },
      );
      for (const id of SECTION_IDS) {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
      }
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected openDrawer(): void {
    this.drawerOpen.set(true);
    this.hidden.set(false);
  }

  protected closeDrawer(): void {
    if (!this.drawerOpen()) return;
    this.drawerOpen.set(false);
    this.toggle().nativeElement.focus();
  }

  protected closeMega(event: FocusEvent, item: HTMLElement): void {
    if (!item.contains(event.relatedTarget as Node | null)) this.megaOpen.set(false);
  }

  /** Con el menú abierto o con el foco dentro, ocultarlo dejaría a alguien sin saber dónde está. */
  private mustStayVisible(): boolean {
    return (
      this.drawerOpen() ||
      this.megaOpen() ||
      this.bar().nativeElement.contains(document.activeElement)
    );
  }
}
