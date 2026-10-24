# Territorio Vivo

Aplicación de descubrimiento regional de turismo, emprendimientos y comercio
local. Base compartida Android/iOS con Expo y React Native. **Maqueta de Fase 0**:
selector territorial, navegación y temas; sin catálogo, ubicación automática ni
rutas reales. No depende de los otros proyectos del usuario.

## Desarrollo

Node 24.19.0 y pnpm 10.33.0. Desde la raíz:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev:mobile
# En otra terminal, si necesitas la página web:
corepack pnpm dev:web
```

En el entorno cloud usar una caché escribible para Corepack y desactivar telemetría
si el directorio de usuario no es escribible:

```bash
export COREPACK_HOME=/workspace/.setup/corepack
export EXPO_NO_TELEMETRY=1
export NEXT_TELEMETRY_DISABLED=1
```

Antes de cada push:

```bash
corepack pnpm validate
```

Ejecuta tipos, ESLint, cinco pruebas iniciales, exportación Metro para Android/iOS y
web, build Next.js y comprobación de formato. **No compila una APK local**. El
workflow de GitHub Actions valida y después compila el APK nativo con firma de
pruebas. Los directorios nativos se generan a partir de Expo y no se versionan.

## Documentación

- [Plan del producto e historial](docs/PLAN.md).
- [Mockups base](docs/diseno/PROPUESTAS.md).
- [Arquitectura y alcance inicial](docs/ESQUELETO-APK.md).
- [Cómo descargar la APK desde GitHub](docs/ANDROID-CI.md).
- [Fuentes públicas y bloqueos](docs/FUENTES-DATOS.md).
- [Presupuesto y propuesta freemium](docs/COSTOS-Y-MONETIZACION.md).
- [Bitácora](docs/BITACORA.md).

PR de borrador a develop; main no se modifica ni se fusiona en esta entrega.
