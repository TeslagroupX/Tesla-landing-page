import { legalSections } from './legal-text';
import { PRIVACY_NOTICE, canonicalNoticeText, longDate } from './privacy-notice';

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

describe('PRIVACY_NOTICE', () => {
  it('should carry the SHA-256 of its own text (pnpm huella:aviso -- --write)', async () => {
    expect(PRIVACY_NOTICE.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(await sha256Hex(PRIVACY_NOTICE.text)).toBe(PRIVACY_NOTICE.sha256);
  });

  it('should be version 1.0', () => {
    expect(PRIVACY_NOTICE.version).toBe('1.0');
    expect(longDate(PRIVACY_NOTICE.effectiveFrom)).toBe('15 de octubre de 2026');
  });

  it('should hash the same text whatever the line endings', () => {
    const windows = PRIVACY_NOTICE.text.replace(/\n/g, '\r\n') + '\r\n\r\n';
    expect(canonicalNoticeText(windows)).toBe(PRIVACY_NOTICE.text);
  });

  it('should open with «En resumen» in one or two paragraphs', () => {
    const [summary] = legalSections(PRIVACY_NOTICE.text);
    expect(summary.summary).toBe(true);
    const paragraphs = summary.blocks.filter((block) => block.kind === 'paragraph');
    expect(paragraphs.length).toBeGreaterThanOrEqual(1);
    expect(paragraphs.length).toBeLessThanOrEqual(2);
  });

  it('should be prose: no lists and no markup', () => {
    for (const line of PRIVACY_NOTICE.text.split('\n')) {
      expect(line).not.toMatch(/^\s*([-*+]|\d+\.)\s/);
    }
    expect(PRIVACY_NOTICE.text).not.toMatch(/[<>[\]`]/);
    expect(PRIVACY_NOTICE.text).not.toContain('POR COMPLETAR');
  });

  it('should identify the company exactly as the intranet policy does', () => {
    expect(PRIVACY_NOTICE.text).toContain(
      'POWER ENERGY & AUTOMATION S.A.C., que opera con el nombre comercial TESLA GROUP, con RUC ' +
        '20559998649 y domicilio fiscal en Av. San José N.° 788, Miramar – Ex Alto Moche, Moche, ' +
        'Trujillo, La Libertad',
    );
    expect(PRIVACY_NOTICE.text).toContain('privacy@teslagroup.pe');
  });

  it('should list the four registered data banks with their codes', () => {
    for (const bank of [
      'Clientes (código PJ-2026-5358)',
      'Prospecto de clientes (código PJ-2026-5359)',
      'Usuarios de la página web (código PJ-2026-5360)',
      'Proveedores (código PJ-2026-5361)',
    ]) {
      expect(PRIVACY_NOTICE.text).toContain(bank);
    }
  });

  it('should tell that documents go whole to an AI provider in the United States', () => {
    expect(PRIVACY_NOTICE.text).toContain('inteligencia artificial');
    expect(PRIVACY_NOTICE.text).toContain('Estados Unidos');
    expect(PRIVACY_NOTICE.text).toContain('El documento se envía completo');
  });

  it('should state the retention periods and the response times', () => {
    for (const fragment of [
      'cinco años sin actividad comercial, se anonimizan',
      'cinco años desde que se cargan',
      'la ubicación de las visitas, cinco años',
      'se conservan dos años desde su recepción',
      'ocho días hábiles para el derecho de información',
      'veinte días hábiles para el de acceso',
      'diez días hábiles para los de rectificación, cancelación y oposición',
    ]) {
      expect(PRIVACY_NOTICE.text).toContain(fragment);
    }
  });
});
