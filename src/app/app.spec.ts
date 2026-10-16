import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';

describe('App routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
  });

  const page = (): HTMLElement => harness.routeNativeElement as HTMLElement;

  it('should render the home page with the contact and the legal links', async () => {
    await harness.navigateByUrl('/');
    expect(page().querySelector('h1')?.textContent).toContain('Estamos construyendo algo nuevo');
    const links = Array.from(page().querySelectorAll('footer nav a')).map((link) => [
      link.textContent?.trim(),
      link.getAttribute('href'),
    ]);
    expect(links).toEqual([
      ['Aviso de privacidad', '/privacidad'],
      ['Cookies', '/cookies'],
      ['Libro de Reclamaciones', '/libro-de-reclamaciones'],
    ]);
  });

  it('should render the privacy notice with its version and date', async () => {
    await harness.navigateByUrl('/privacidad');
    expect(page().querySelector('h1')?.textContent).toBe('Aviso de privacidad');
    expect(page().textContent).toContain('Versión 1.0 · Vigente desde el 16 de octubre de 2026');
    expect(page().querySelector('h2')?.textContent).toBe('En resumen');
  });

  it('should render the cookies page', async () => {
    await harness.navigateByUrl('/cookies');
    expect(page().querySelector('h1')?.textContent).toBe('Cookies');
  });

  it('should say that the complaints book is a physical one', async () => {
    await harness.navigateByUrl('/libro-de-reclamaciones');
    expect(page().querySelector('h1')?.textContent).toBe('Libro de Reclamaciones');
    expect(page().textContent).toContain('Libro de Reclamaciones físico en sus oficinas');
  });

  it('should send an unknown path to the home page', async () => {
    await harness.navigateByUrl('/no-existe');
    expect(TestBed.inject(Router).url).toBe('/');
    expect(page().querySelector('h1')?.textContent).toContain('Estamos construyendo algo nuevo');
  });
});
