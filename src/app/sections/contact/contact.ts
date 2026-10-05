import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { CONTACT } from '../../content/landing.content';
import { Reveal } from '../../shared/reveal';
import {
  EMAIL_PATTERN,
  PHONE_PATTERN,
  RULES,
  SECTOR_OPTIONS,
  SOLUTION_OPTIONS,
  attachmentProblem,
  formatBytes,
  toFormData,
} from './contact.model';
import { ContactService, errorMessage } from './contact.service';

/** Longitud sin contar los espacios de los extremos: «  a  » no es un nombre de cinco letras. */
function trimmedLength(min: number, max: number): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const length = control.value.trim().length;
    return length < min || length > max ? { length: true } : null;
  };
}

/** En el orden de la pantalla: el primero que falle recibe el foco. */
const FIELDS = [
  'name',
  'company',
  'email',
  'phone',
  'sector',
  'solution',
  'description',
  'consent',
] as const;
type Field = (typeof FIELDS)[number];

const MESSAGES: Record<Field, string> = {
  name: 'Escriba su nombre y apellido.',
  company: 'Escriba el nombre de su empresa.',
  email: 'Escriba un correo válido, como nombre@empresa.com.',
  phone: 'Escriba un teléfono: solo números, espacios y los signos + ( ) -.',
  sector: 'Elija un sector.',
  solution: 'Elija una solución de interés.',
  description: 'Describa su requerimiento con al menos 10 caracteres.',
  consent: 'Para enviar la solicitud, acepte el tratamiento de sus datos.',
};

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, Reveal],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly info = CONTACT;
  protected readonly sectorOptions = SECTOR_OPTIONS;
  protected readonly solutionOptions = SOLUTION_OPTIONS;
  protected readonly rules = RULES;
  protected readonly formatBytes = formatBytes;

  protected readonly status = signal<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  protected readonly progress = signal(0);
  protected readonly requestNumber = signal<string | null>(null);
  protected readonly sentTo = signal('');
  protected readonly doneTitle = computed(() => {
    const number = this.requestNumber();
    return number ? `Recibimos su solicitud N.º ${number}.` : 'Recibimos su solicitud.';
  });
  protected readonly failure = signal('');
  protected readonly submitted = signal(false);

  protected readonly attachment = signal<File | null>(null);
  protected readonly attachmentError = signal<string | null>(null);
  protected readonly dragging = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', trimmedLength(RULES.name.min, RULES.name.max)],
    company: ['', trimmedLength(RULES.company.min, RULES.company.max)],
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(EMAIL_PATTERN),
        Validators.maxLength(RULES.email.max),
      ],
    ],
    phone: [
      '',
      [Validators.pattern(PHONE_PATTERN), trimmedLength(RULES.phone.min, RULES.phone.max)],
    ],
    sector: ['', Validators.required],
    solution: ['', Validators.required],
    description: ['', trimmedLength(RULES.description.min, RULES.description.max)],
    consent: [false, Validators.requiredTrue],
    website: [''],
  });

  private readonly service = inject(ContactService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly done = viewChild<ElementRef<HTMLElement>>('done');

  constructor() {
    // El aviso de éxito sustituye al formulario: sin mover el foco, quien navega con teclado o
    // lector de pantalla se quedaría en un botón que ya no existe.
    afterRenderEffect(() => {
      if (this.status() === 'sent') this.done()?.nativeElement.focus();
    });
  }

  /** El error se enseña al salir del campo o al intentar enviar, no mientras se escribe. */
  protected shows(field: Field): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  protected message(field: Field): string {
    return MESSAGES[field];
  }

  protected pick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.attach(file);
    // Vacío para que elegir otra vez el mismo archivo vuelva a avisar.
    input.value = '';
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.attach(file);
  }

  protected dragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected removeAttachment(): void {
    this.attachment.set(null);
    this.attachmentError.set(null);
  }

  protected submit(): void {
    if (this.status() === 'sending') return;

    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first = FIELDS.find((field) => this.form.controls[field].invalid);
      this.document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    const request = this.form.getRawValue();
    this.status.set('sending');
    this.progress.set(0);
    this.failure.set('');

    this.service
      .submit(toFormData(request, this.attachment()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event.kind === 'progress') {
            this.progress.set(event.percent);
            return;
          }
          this.requestNumber.set(event.requestNumber);
          this.sentTo.set(request.email.trim());
          this.form.reset();
          this.removeAttachment();
          this.submitted.set(false);
          this.status.set('sent');
        },
        error: (error: unknown) => {
          this.failure.set(errorMessage(error));
          this.status.set('failed');
        },
      });
  }

  private attach(file: File): void {
    const problem = attachmentProblem(file);
    this.attachmentError.set(problem);
    this.attachment.set(problem ? null : file);
  }
}
