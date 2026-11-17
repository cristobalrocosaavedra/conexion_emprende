# Publicar la web en Cloudflare Pages

La web es un **sitio propio** (Next.js, `apps/web`) con una página por región (`/region/valparaiso`), provincia (`/provincia/petorca`), comuna (`/la-ligua`) y ficha (`/la-ligua/chocolateria-matichoc`), cada una con sus pestañas Qué hacer, Explorar y Negocios. La app de mapa y rutas (Expo) queda dentro del mismo sitio en `/explorar`. No usa servidor propio: son archivos estáticos (unas 8.600, dentro del límite de Pages).

## Qué ya está preparado en el repositorio

- `pnpm build:sitio` genera `apps/web/out`: el sitio completo más la app de rutas en `/explorar`. (`pnpm build:web` sigue generando solo la app en `apps/mobile/dist`.)
- `apps/web/public/_redirects`: las direcciones bajo `/explorar/` abren la app de rutas.
- `apps/web/public/_headers`: cabeceras de seguridad; ubicación permitida solo para el propio sitio. **`X-Robots-Tag: noindex` y `robots.txt` bloquean Google mientras sea versión de prueba**; se quitan solo cuando apruebes abrirla.
- Probar en tu computador: `pnpm build:sitio` y luego `node scripts/web/servir-sitio.mjs` (abre http://127.0.0.1:3013).
- Ubicación: la pide el navegador al tocar «Usar mi ubicación»; si se rechaza, se elige región o comuna a mano. No se envían ni guardan coordenadas.

## Paso a paso (lo haces tú; no compartas claves en el chat)

1. Entra a dash.cloudflare.com con verificación en dos pasos activada.
2. **Workers y Pages → Crear → Pages → Conectar a Git** y elige el repositorio `conexion_emprende`.
3. Configuración de compilación:
   - Rama de producción: `main` (solo se publica cuando tú fusiones).
   - Comando de compilación: `pnpm build:sitio`
   - Carpeta de salida: `apps/web/out`
   - Variables de entorno: `NODE_VERSION` = `24.19.0`.
   - Opcionales y públicas (no son secretas): `EXPO_PUBLIC_CONTACTO_CORREO` y `EXPO_PUBLIC_CONTACTO_WHATSAPP`. Sin ellas, la página muestra «Muy pronto publicaremos el contacto».
4. Guarda. Cada rama (por ejemplo `develop` o un PR) recibe su propia dirección de vista previa `*.pages.dev` para revisar antes de publicar.
5. Cuando compres el dominio: **Pages → tu proyecto → Dominios personalizados → turismoentumano.cl**, y sigue las instrucciones de DNS.
6. Para un municipio con plan promocional, se agrega su dominio (`comunaentumano.cl`) al mismo proyecto; la app mostrará su comuna (ajuste pendiente cuando haya convenio).

## Antes de abrir al público

- Términos y privacidad revisados.
- Decidir qué datos pendientes se muestran (hoy: catálogo transversal rotulado como pendiente).
- Mapas: las teselas públicas de OpenStreetMap no admiten tráfico alto; pasar a mapas propios (PMTiles) antes de difundir.
- Rutas por calles: el servicio público de pruebas no sirve para tráfico real; servidor propio pendiente.
- Quitar `noindex` y `robots.txt` cuando apruebes la publicación.
