# Territorio Vivo

Maqueta territorial Android/iOS con Expo y React Native: portadas regionales,
gestos como una lista norte/sur, selector compacto, recorrido visual por Chile,
catálogo de referencia de Petorca y primera base comunitaria de las 16 regiones, mapa,
fichas y selección de paradas. Los productos de origen permanecen independientes.

## Desarrollo

Node 24.19.0, pnpm 10.33.0 y Python 3.10 o posterior para las pruebas del
importador local. Desde la raíz:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev:mobile
# Página web mínima del proyecto:
corepack pnpm dev:web
```

En este entorno cloud:

```bash
export COREPACK_HOME=/workspace/.setup/corepack
export EXPO_NO_TELEMETRY=1
export NEXT_TELEMETRY_DISABLED=1
export PW_CHROMIUM_PATH=/usr/bin/chromium
```

En otras máquinas, instalar Chromium para Playwright con
`corepack pnpm exec playwright install --with-deps chromium` en lugar de definir
PW_CHROMIUM_PATH. GitHub Actions lo prepara antes de validar.

Antes de cada push:

```bash
corepack pnpm validate
```

Incluye tipos, ESLint, pruebas de lógica/catálogo, exportaciones Metro
Android/iOS/web, build Next.js, pruebas de interfaz y formato. No compila APK
local. El workflow prepara Android, compila y verifica la APK en GitHub.

## Documentación

- [Plan e historial](docs/PLAN.md).
- [Mockups base](docs/diseno/PROPUESTAS.md).
- [Qué incluye la maqueta 0.3](docs/MAQUETA-0.3.md).
- [Catálogo maestro: simulación y modelo candidato](docs/catalogo-maestro/README.md).
- [Referencias nacionales y fuentes](docs/CATALOGO-NACIONAL.md).
- [Procedencia y licencia del extracto OSM](content/sources/OSM-CHILE.md).
- [APK desde GitHub](docs/ANDROID-CI.md).
- [Fuentes públicas](docs/FUENTES-DATOS.md).
- [Elementos reutilizados y condiciones](content/sources/REUTILIZACION.md).
- [Presupuesto y freemium](docs/COSTOS-Y-MONETIZACION.md).
- [Bitácora](docs/BITACORA.md).

Catálogo pendiente de revisión; eventos de ejemplo; rutas esquemáticas. Sin
registro de oferentes, backend productivo ni cobros. PR borrador a develop;
main no se modifica en estas entregas.
