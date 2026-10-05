import { Component, ElementRef, computed, inject, viewChild } from '@angular/core';

import { CASES, SECTORS, SectorId } from '../../content/landing.content';
import { LandingState } from '../../shared/landing-state';
import { MediaSlot } from '../../shared/media-slot/media-slot';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-cases',
  imports: [MediaSlot, Reveal],
  templateUrl: './cases.html',
  styleUrl: './cases.scss',
})
export class Cases {
  protected readonly sectors = SECTORS;
  protected readonly state = inject(LandingState);

  protected readonly visible = computed(() => {
    const sector = this.state.sector();
    return sector ? CASES.filter((item) => item.sector === sector) : CASES;
  });

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  protected sectorLabel(id: SectorId): string {
    return SECTORS.find((sector) => sector.id === id)?.label ?? '';
  }

  /** Avanza o retrocede una card. */
  protected scroll(direction: 1 | -1): void {
    const track = this.track()?.nativeElement;
    const card = track?.firstElementChild;
    if (!track || !card) return;

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (card.clientWidth + gap), behavior: 'smooth' });
  }
}
