import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import { NAV } from '../../../content/landing.content';

/** El menú de tablet y móvil. Quien lo abre decide cuándo: aquí solo se pide cerrarlo. */
@Component({
  selector: 'app-nav-drawer',
  templateUrl: './nav-drawer.html',
  styleUrl: './nav-drawer.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.inert]': "open() ? null : ''",
    '(keydown.escape)': 'closed.emit()',
    '(keydown.tab)': 'keepFocusInside($event)',
  },
})
export class NavDrawer {
  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly nav = NAV;

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('close');

  constructor() {
    const document = inject(DOCUMENT);

    // Después del render: con `inert` todavía puesto el foco no entraría.
    afterRenderEffect(() => {
      const open = this.open();
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) this.closeButton().nativeElement.focus();
    });
  }

  /** El resto de la página queda detrás: el tabulador da la vuelta dentro del menú. */
  protected keepFocusInside(event: Event): void {
    const focusable = this.panel().nativeElement.querySelectorAll<HTMLElement>('a[href], button');
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const backwards = (event as KeyboardEvent).shiftKey;
    const current = event.target;

    if (backwards && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!backwards && current === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
