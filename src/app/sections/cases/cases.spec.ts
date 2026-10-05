import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingState } from '../../shared/landing-state';
import { Cases } from './cases';

describe('Cases', () => {
  let fixture: ComponentFixture<Cases>;
  let state: LandingState;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Cases] }).compileComponents();

    fixture = TestBed.createComponent(Cases);
    state = TestBed.inject(LandingState);
    page = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  function titles(): string[] {
    return Array.from(page.querySelectorAll('.case__title')).map(
      (title) => title.textContent?.trim() ?? '',
    );
  }

  function chip(label: string): HTMLButtonElement {
    return Array.from(page.querySelectorAll<HTMLButtonElement>('.chip')).find(
      (button) => button.textContent?.trim() === label,
    )!;
  }

  it('should show every project until a sector is chosen', () => {
    expect(titles().length).toBe(3);
    expect(chip('Todos').getAttribute('aria-pressed')).toBe('true');
    expect(chip('Pesca').getAttribute('aria-pressed')).toBe('false');
  });

  it('should filter by the sector of the chip', async () => {
    chip('Pesca').click();
    await fixture.whenStable();

    expect(titles()).toEqual(['Tableros de fuerza y control para planta de harina']);
    expect(chip('Pesca').getAttribute('aria-pressed')).toBe('true');
    expect(chip('Todos').getAttribute('aria-pressed')).toBe('false');
  });

  it('should open with the sector chosen in another block', async () => {
    state.sector.set('mineria');
    await fixture.whenStable();

    expect(titles()).toEqual(['Instrumentación y control de planta concentradora']);
    expect(chip('Minería').getAttribute('aria-pressed')).toBe('true');
  });

  it('should say so when a sector has no projects yet', async () => {
    chip('Petróleo y gas').click();
    await fixture.whenStable();

    expect(titles()).toEqual([]);
    expect(page.querySelector('.cases__empty')?.textContent).toContain(
      'Aún no hay proyectos publicados de este sector.',
    );
  });

  it('should mark what is still to be confirmed', () => {
    expect(page.querySelector('.case__result .pending')?.textContent).toBe('[dato medible]');
  });
});
