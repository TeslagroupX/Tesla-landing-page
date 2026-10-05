import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Entrada de sección: el elemento sube 16 px y aparece la primera vez que entra en pantalla.
 *
 * Solo oculta lo que está fuera de la vista cuando arranca en el navegador. En el HTML
 * prerenderizado, sin JavaScript o sin `IntersectionObserver`, todo queda visible; y lo que ya
 * se veía al cargar no parpadea.
 *
 * El valor es la posición dentro de un grupo: escalona la entrada 80 ms por elemento.
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  readonly appReveal = input<number | ''>('');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;

      let armed = false;
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting) {
          if (armed) host.classList.add('is-visible');
          observer.disconnect();
        } else if (!armed) {
          armed = true;
          host.style.setProperty('--reveal-delay', `${(Number(this.appReveal()) || 0) * 80}ms`);
          host.classList.add('reveal--armed');
        }
      });
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
