import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contact } from './contact';
import { GENERIC_ERROR } from './contact.service';

describe('Contact', () => {
  let fixture: ComponentFixture<Contact>;
  let http: HttpTestingController;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    http = TestBed.inject(HttpTestingController);
    page = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function field<T extends HTMLElement = HTMLInputElement>(name: string): T {
    return page.querySelector<T>(`#contact-${name}`)!;
  }

  function type(name: string, value: string): void {
    const input = field(name);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }

  function choose(name: string, value: string): void {
    const select = field<HTMLSelectElement>(name);
    select.value = value;
    select.dispatchEvent(new Event('change'));
    select.dispatchEvent(new Event('blur'));
  }

  function attach(file: File): void {
    const input = field('attachment');
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
  }

  function fillValid(): void {
    type('name', 'Ana Torres');
    type('company', 'Minera del Norte');
    type('email', 'ana.torres@minera.pe');
    type('phone', '+51 944 000 000');
    choose('sector', 'mineria');
    choose('solution', 'power_system');
    type('description', 'Tablero de distribución para planta concentradora.');
    field('consent').click();
  }

  async function submit(): Promise<void> {
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  function errorOf(name: string): string | undefined {
    return page.querySelector(`#contact-${name}-error`)?.textContent?.trim();
  }

  it('should not send an empty form and should say what is missing', async () => {
    await submit();

    http.expectNone('/api/contact');
    expect(errorOf('name')).toBe('Escriba su nombre y apellido.');
    expect(errorOf('email')).toContain('correo válido');
    expect(errorOf('sector')).toBe('Elija un sector.');
    expect(field('name').getAttribute('aria-invalid')).toBe('true');
    expect(field('name').getAttribute('aria-describedby')).toBe('contact-name-error');
    expect(document.activeElement).toBe(field('name'));
  });

  it('should show the error of a field only after leaving it', async () => {
    type('phone', 'abc');
    await fixture.whenStable();

    expect(errorOf('phone')).toContain('solo números');
    expect(errorOf('name')).toBeUndefined();
  });

  it('should not take as an address something that would change the mail link', async () => {
    type('email', 'ana@minera.pe?subject=hola');
    await fixture.whenStable();
    expect(errorOf('email')).toContain('correo válido');

    type('email', 'ana.torres+obras@minera-norte.com.pe');
    await fixture.whenStable();
    expect(errorOf('email')).toBeUndefined();
  });

  it('should not send without consent', async () => {
    fillValid();
    field('consent').click();
    await submit();

    http.expectNone('/api/contact');
    expect(errorOf('consent')).toContain('acepte el tratamiento');
  });

  it('should reject an attachment that is neither PDF nor DWG', async () => {
    attach(new File(['x'], 'plano.png', { type: 'image/png' }));
    await fixture.whenStable();

    expect(errorOf('attachment')).toBe('Solo se aceptan archivos PDF o DWG.');
    expect(page.querySelector('.attach__file')).toBeNull();
  });

  it('should reject an attachment over 25 MB', async () => {
    const heavy = new File(['x'], 'bases.pdf', { type: 'application/pdf' });
    Object.defineProperty(heavy, 'size', { value: 25 * 1024 * 1024 + 1 });
    attach(heavy);
    await fixture.whenStable();

    expect(errorOf('attachment')).toContain('el máximo son 25 MB');
    expect(page.querySelector('.attach__file')).toBeNull();
  });

  it('should send the form with its attachment to the proxy of the landing', async () => {
    const file = new File(['%PDF-1.7'], 'bases.pdf', { type: 'application/pdf' });
    fillValid();
    attach(file);
    await submit();

    const sent = http.expectOne('/api/contact');
    const body = sent.request.body as FormData;
    expect(sent.request.method).toBe('POST');
    expect(body.get('name')).toBe('Ana Torres');
    expect(body.get('company')).toBe('Minera del Norte');
    expect(body.get('email')).toBe('ana.torres@minera.pe');
    expect(body.get('phone')).toBe('+51 944 000 000');
    expect(body.get('sector')).toBe('mineria');
    expect(body.get('solution')).toBe('power_system');
    expect(body.get('consent')).toBe('true');
    expect(body.get('website')).toBe('');
    expect((body.get('attachment') as File).name).toBe('bases.pdf');

    sent.flush({ requestNumber: '0042' }, { status: 202, statusText: 'Accepted' });
    await fixture.whenStable();

    const done = page.querySelector('[role="status"]');
    expect(done?.textContent).toContain('Recibimos su solicitud N.º 0042.');
    expect(done?.textContent).toContain('Le escribiremos a ana.torres@minera.pe.');
    expect(page.querySelector('form')).toBeNull();
    expect(document.activeElement).toBe(done);
  });

  it('should show how much has been uploaded while sending', async () => {
    fillValid();
    await submit();

    const sent = http.expectOne('/api/contact');
    sent.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 200 });
    await fixture.whenStable();

    const button = page.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(button.textContent).toContain('25 %');
    expect(button.disabled).toBe(true);
    expect(page.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('25');

    sent.flush({ requestNumber: null }, { status: 202, statusText: 'Accepted' });
    await fixture.whenStable();
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Recibimos su solicitud.');
  });

  it('should show the message of the server and keep the form when it refuses', async () => {
    fillValid();
    await submit();

    http
      .expectOne('/api/contact')
      .flush(
        { status: 429, message: 'Demasiadas solicitudes. Inténtelo más tarde.' },
        { status: 429, statusText: 'Too Many Requests' },
      );
    await fixture.whenStable();

    const alert = page.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Demasiadas solicitudes. Inténtelo más tarde.');
    expect(alert?.querySelector('a')?.getAttribute('href')).toBe('mailto:proyectos@teslagroup.pe');
    expect(field('name').value).toBe('Ana Torres');
  });

  it('should fall back to a generic message when there is no answer to read', async () => {
    fillValid();
    await submit();

    http.expectOne('/api/contact').error(new ProgressEvent('error'));
    await fixture.whenStable();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain(GENERIC_ERROR);
  });
});
