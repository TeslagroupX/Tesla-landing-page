import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    page = fixture.nativeElement as HTMLElement;
  });

  it('should render the hero headline as the only h1', () => {
    const headlines = page.querySelectorAll('h1');
    expect(headlines.length).toBe(1);
    expect(headlines[0].textContent).toContain(
      'Integración industrial para operaciones que no pueden detenerse.',
    );
  });

  it('should render the blocks of the wireframe in order', () => {
    const sections = Array.from(page.querySelectorAll('main > * > section')).map(
      (section) => section.id,
    );
    expect(sections).toEqual([
      'inicio',
      'soluciones',
      'sectores',
      'casos',
      'tecnologia',
      'contacto',
    ]);
    expect(page.querySelector('header')).toBeTruthy();
    expect(page.querySelector('footer')).toBeTruthy();
  });

  it('should offer a skip link to the main content', () => {
    const skip = page.querySelector('a');
    expect(skip?.getAttribute('href')).toBe('#contenido');
    expect(page.querySelector('main')?.id).toBe('contenido');
  });

  it('should keep a destination that is not ready visible but disabled', () => {
    const about = Array.from(page.querySelectorAll('header nav a')).find(
      (link) => link.textContent?.trim() === 'Nosotros',
    );
    expect(about?.getAttribute('aria-disabled')).toBe('true');
    expect(about?.hasAttribute('href')).toBe(false);
  });
});
