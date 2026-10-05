import { attachmentProblem, formatBytes, toFormData } from './contact.model';

function fileOf(name: string, size: number): File {
  const file = new File(['x'], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('attachmentProblem', () => {
  it('should accept PDF and DWG whatever the case of the extension', () => {
    expect(attachmentProblem(fileOf('bases.pdf', 1024))).toBeNull();
    expect(attachmentProblem(fileOf('PLANO.DWG', 1024))).toBeNull();
  });

  it('should accept a file of exactly 25 MB', () => {
    expect(attachmentProblem(fileOf('bases.pdf', 25 * 1024 * 1024))).toBeNull();
  });

  it('should reject any other extension, or none', () => {
    expect(attachmentProblem(fileOf('plano.dwg.exe', 1024))).toBe(
      'Solo se aceptan archivos PDF o DWG.',
    );
    expect(attachmentProblem(fileOf('pdf', 1024))).toBe('Solo se aceptan archivos PDF o DWG.');
  });

  it('should reject an empty file', () => {
    expect(attachmentProblem(fileOf('bases.pdf', 0))).toBe('El archivo está vacío.');
  });

  it('should say how much a file over the limit weighs', () => {
    expect(attachmentProblem(fileOf('bases.pdf', 31 * 1024 * 1024))).toBe(
      'El archivo pesa 31.0 MB y el máximo son 25 MB.',
    );
  });
});

describe('formatBytes', () => {
  it('should use KB below one megabyte and never show zero', () => {
    expect(formatBytes(10)).toBe('1 KB');
    expect(formatBytes(860 * 1024)).toBe('860 KB');
  });

  it('should use MB with a decimal point', () => {
    expect(formatBytes(3.2 * 1024 * 1024)).toBe('3.2 MB');
  });
});

describe('toFormData', () => {
  it('should trim what was typed and leave the attachment out when there is none', () => {
    const data = toFormData(
      {
        name: '  Ana Torres ',
        company: ' Minera del Norte',
        email: 'ana@minera.pe ',
        phone: ' 944 000 000 ',
        sector: 'mineria',
        solution: 'por_definir',
        description: '  Tablero de distribución.  ',
        consent: true,
        website: '',
      },
      null,
    );

    expect(data.get('name')).toBe('Ana Torres');
    expect(data.get('company')).toBe('Minera del Norte');
    expect(data.get('email')).toBe('ana@minera.pe');
    expect(data.get('phone')).toBe('944 000 000');
    expect(data.get('description')).toBe('Tablero de distribución.');
    expect(data.get('consent')).toBe('true');
    expect(data.has('attachment')).toBe(false);
  });
});
