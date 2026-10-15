import { TestBed } from '@angular/core/testing';

import { LegalText, legalBlocks, legalSections, textFragments } from './legal-text';

describe('legalBlocks', () => {
  it('should split headings and paragraphs, joining the lines of a paragraph', () => {
    expect(legalBlocks('## Uno\n\nPrimera\nlínea.\n\nOtra.\r\n## Dos')).toEqual([
      { kind: 'heading', text: 'Uno' },
      { kind: 'paragraph', text: 'Primera línea.' },
      { kind: 'paragraph', text: 'Otra.' },
      { kind: 'heading', text: 'Dos' },
    ]);
  });

  it('should keep anything else as plain text', () => {
    expect(legalBlocks('- <b>no</b> [x](http://a)')).toEqual([
      { kind: 'paragraph', text: '- <b>no</b> [x](http://a)' },
    ]);
  });
});

describe('textFragments', () => {
  it('should link only the e-mail addresses, leaving the final period out', () => {
    expect(textFragments('Escriba a privacy@teslagroup.pe.')).toEqual([
      { text: 'Escriba a ', email: false },
      { text: 'privacy@teslagroup.pe', email: true },
      { text: '.', email: false },
    ]);
  });
});

describe('legalSections', () => {
  it('should mark «En resumen» as the summary', () => {
    const sections = legalSections('## En resumen\n\nA.\n\n## 1. Otro\n\nB.');
    expect(sections.map((section) => section.summary)).toEqual([true, false]);
  });
});

describe('LegalText', () => {
  it('should render escaped text with a mailto link and no other markup', async () => {
    const fixture = TestBed.createComponent(LegalText);
    fixture.componentRef.setInput(
      'text',
      '## Título\n\n<img src=x> Escriba a privacy@teslagroup.pe.',
    );
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h2')?.textContent).toBe('Título');
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('p')?.textContent).toContain('<img src=x>');
    const links = host.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('mailto:privacy@teslagroup.pe');
  });
});
