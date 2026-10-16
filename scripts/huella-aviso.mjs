// La huella SHA-256 del aviso de privacidad, calculada fuera de Angular.
//
//   pnpm huella:aviso              imprime la huella y dice si coincide con la del código
//   pnpm huella:aviso -- --write   la escribe en src/app/legal/privacy-notice.ts
//
// Es la misma cuenta que hace la prueba (`privacy-notice.spec.ts`) y la que puede repetir
// cualquiera con el .md en la mano: el texto con saltos LF y sin espacios ni saltos al final,
// en UTF-8, por SHA-256, en hexadecimal. Sale con código 1 si la del código no coincide.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'src/app/legal/privacy-notice.md');
const constantPath = join(root, 'src/app/legal/privacy-notice.ts');

const text = readFileSync(sourcePath, 'utf8').replace(/\r\n?/g, '\n').trimEnd();
const hash = createHash('sha256').update(text, 'utf8').digest('hex');

const code = readFileSync(constantPath, 'utf8');
const pattern = /(sha256: ')([0-9a-f]{64})(')/;
const current = code.match(pattern)?.[2];

console.log(hash);

if (process.argv.includes('--write')) {
  if (!current) {
    console.error('No se encontró la constante sha256 en privacy-notice.ts.');
    process.exit(1);
  }
  if (current !== hash) writeFileSync(constantPath, code.replace(pattern, `$1${hash}$3`));
  console.log(current === hash ? 'Sin cambios.' : 'Huella actualizada en privacy-notice.ts.');
} else if (current !== hash) {
  console.error(`La huella del código (${current ?? 'ninguna'}) no es la del texto.`);
  process.exit(1);
}
