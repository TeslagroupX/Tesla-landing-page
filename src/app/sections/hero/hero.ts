import { Component, inject } from '@angular/core';

import { HERO, SECTORS } from '../../content/landing.content';
import { LandingState } from '../../shared/landing-state';
import { MediaSlot } from '../../shared/media-slot/media-slot';

@Component({
  selector: 'app-hero',
  imports: [MediaSlot],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  protected readonly hero = HERO;
  protected readonly sectors = SECTORS;
  protected readonly state = inject(LandingState);
}
