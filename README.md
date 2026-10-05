# Tesla Group — Landing Page

Aquí será la Landing Page de la empresa **Tesla Group**.

## Sobre la empresa

Tesla Group es una empresa peruana especializada en **integración industrial**, fundada en 2014, con sede en Trujillo (La Libertad) y oficina en Lima. Ofrece soluciones de diseño e ingeniería, asesoría y consultoría, y automatización y ensamblaje de tableros eléctricos.

Atiende sectores como **minería, petróleo y gas, agroindustria y pesca**, con experiencia en automatización de procesos, tableros eléctricos, sistemas de vapor, neumática, digitalización, PLC y SCADA. Su objetivo es consolidarse como la empresa líder de integración industrial en el Perú, combinando tecnología, digitalización y responsabilidad ambiental.

## Acerca de este proyecto

Aplicación web desarrollada con [Angular](https://angular.dev) (v22, con renderizado en servidor) que sirve como página de presentación oficial de Tesla Group. Implementa el wireframe de la landing: header, hero, soluciones, trayectoria y proyectos, tecnología, contacto y footer.

### Contenido pendiente

Todo el texto y los datos están en [`src/app/content/landing.content.ts`](src/app/content/landing.content.ts). Lo que aún no está confirmado se ve en la página como pendiente: los datos entre `[corchetes]`, las fotos y el video como una textura con su rótulo, y los enlaces sin destino (`href: null`) visibles pero deshabilitados. Completar un dato en ese archivo lo activa. **No publicar a `main` hasta completarlos.**

### Formulario de contacto

El navegador envía el formulario a `POST /api/contact`, en este mismo servidor ([`src/server/contact-proxy.ts`](src/server/contact-proxy.ts)), que lo reenvía tal cual al backend de la Intranet (`POST /api/v1/public/contact-requests`, en `TG-Kotlin`). La landing no guarda nada: validar, limitar por IP, guardar la solicitud y avisar por correo es cosa del backend.

| Variable | Para qué |
|---|---|
| `CONTACT_API_URL` | Dirección del endpoint del backend. En producción, `http://tg-frontend/api/v1/public/contact-requests` (red interna de Docker). Sin ella el formulario responde 503 y ofrece el correo |

Las reglas del formulario ([`contact.model.ts`](src/app/sections/contact/contact.model.ts)) son las mismas que valida el backend: cambiar una exige cambiarla en los dos sitios.

Para probarlo en local, con el backend levantado:

```bash
CONTACT_API_URL=http://localhost:8080/api/v1/public/contact-requests pnpm start
```

## Desarrollo

Servidor de desarrollo local:

```bash
pnpm start
```

La aplicación se sirve en `http://localhost:4201/` y se recarga automáticamente al modificar los archivos fuente.

## Build de producción

```bash
pnpm build
```

Los artefactos se generan en el directorio `dist/`.

## Pruebas unitarias

Pruebas con el runner [Vitest](https://vitest.dev/):

```bash
pnpm test
```

## Créditos

Desarrollado por el **área de TI de Tesla Group**, específicamente por **Valentin Fernandez**.
