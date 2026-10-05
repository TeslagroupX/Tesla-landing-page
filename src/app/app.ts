import { Component } from '@angular/core';

import { Cases } from './sections/cases/cases';
import { Contact } from './sections/contact/contact';
import { SiteFooter } from './sections/footer/footer';
import { SiteHeader } from './sections/header/header';
import { Hero } from './sections/hero/hero';
import { MobileCtaBar } from './sections/mobile-cta-bar/mobile-cta-bar';
import { Solutions } from './sections/solutions/solutions';
import { Technology } from './sections/technology/technology';
import { TrackRecord } from './sections/track-record/track-record';

@Component({
  selector: 'app-root',
  imports: [
    SiteHeader,
    Hero,
    Solutions,
    TrackRecord,
    Cases,
    Technology,
    Contact,
    SiteFooter,
    MobileCtaBar,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
