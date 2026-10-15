/** Los `.md` se importan como texto (`loader` de `angular.json`): hoy, el aviso de privacidad. */
declare module '*.md' {
  const content: string;
  export default content;
}
