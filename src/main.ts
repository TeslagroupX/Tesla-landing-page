import { provideHttpClient, withXhr } from '@angular/common/http';
import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// XHR solo en el navegador: es el único backend de HttpClient que informa del progreso de una
// subida (el formulario de contacto admite un adjunto de 25 MB). En el servidor se queda el
// `fetch` por defecto, que es lo que Angular pide ahí.
const browserConfig = mergeApplicationConfig(appConfig, {
  providers: [provideHttpClient(withXhr())],
});

bootstrapApplication(App, browserConfig)
  .catch((err) => console.error(err));
