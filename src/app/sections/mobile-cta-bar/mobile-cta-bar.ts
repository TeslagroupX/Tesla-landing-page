import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

import { CONTACT } from '../../content/landing.content';

/**
 * Barra fija de móvil. Aparece al dejar atrás el hero —que ya tiene su botón— y se quita sobre
 * el formulario, donde taparía el botón de enviar.
 */
@Component({
  selector: 'app-mobile-cta-bar',
  templateUrl: './mobile-cta-bar.html',
  styleUrl: './mobile-cta-bar.scss',
  host: {
    '[class.is-visible]': 'visible()',
    '[attr.inert]': "visible() ? null : ''",
  },
})
export class MobileCtaBar {
  protected readonly phone = CONTACT.phone;
  protected readonly visible = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;

      const onScreen = new Set<string>();
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target.id);
          else onScreen.delete(entry.target.id);
        }
        this.visible.set(onScreen.size === 0);
      });
      for (const id of ['inicio', 'contacto']) {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
      }
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
