import { Routes } from '@angular/router';

import { ComplaintsBook } from './pages/complaints-book/complaints-book';
import { Cookies } from './pages/cookies/cookies';
import { Home } from './pages/home/home';
import { Privacy } from './pages/privacy/privacy';

/**
 * Todas sin parámetros: `app.routes.server.ts` las prerenderiza al construir la imagen, y cada
 * una sale como HTML estático que se lee sin JavaScript.
 */
export const routes: Routes = [
  { path: '', component: Home, title: 'Tesla Group' },
  { path: 'privacidad', component: Privacy, title: 'Aviso de privacidad · Tesla Group' },
  { path: 'cookies', component: Cookies, title: 'Cookies · Tesla Group' },
  {
    path: 'libro-de-reclamaciones',
    component: ComplaintsBook,
    title: 'Libro de Reclamaciones · Tesla Group',
  },
  { path: '**', redirectTo: '' },
];
