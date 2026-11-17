# Base de datos — Turismo en tu Mano

Propuesta del 16-11-2026 para Supabase (Postgres + PostGIS). Migración: [supabase/migrations/20261116000000_esquema_inicial.sql](../supabase/migrations/20261116000000_esquema_inicial.sql). No está aplicada a ningún proyecto remoto.

## Idea central

Una sola base para todo el país. Cada comuna existe desde el inicio y se ve en `turismoentumano.cl/<comuna>`. Si un municipio contrata el plan promocional, su espacio suma identidad local y dominio propio (`<comuna>entumano.cl`) con **los mismos datos**. La dirección oficial para buscadores es el dominio municipal cuando existe y está autorizado; si no, `/comuna`.

## Tablas

| Grupo      | Tablas                                                             | Para qué                                                                                                               |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Territorio | `regiones`, `provincias`, `comunas`                                | Jerarquía CUT oficial, centro y límite. Se cargan desde fuente oficial; no se inventan.                                |
| Espacios   | `espacios_comunales`                                               | Plan (`base` o `promocion_municipal`), municipio, dominio propio, identidad, convenio y autorización de publicar.      |
| Miembros   | `organizaciones`, `miembros`, `equipo`                             | Negocios, agrupaciones, instituciones, municipios y cadenas; roles propietario/editor; equipo interno admin/moderador. |
| Catálogo   | `categorias`, `fichas`, `fuentes`, `evidencias`, `medios`          | Fichas con ubicación PostGIS, ícono por categoría, fuentes con licencia y evidencia por campo; fotos con autorización. |
| Moderación | `solicitudes`                                                      | Todo cambio de negocios, municipios o comunidad entra como solicitud; el equipo aprueba.                               |
| Viaje      | `rutas`, `paradas_ruta`, `eventos`                                 | Rutas curadas con paradas enlazadas a fichas (resuelve las `stops` vacías del JSON actual).                            |
| Comercial  | `planes`, `promociones`, `suscripciones`, `documentos_tributarios` | Precios netos con IVA calculado; fundadores y lanzamiento; boleta o factura; solo referencias del proveedor de pagos.  |
| Medición   | `estadisticas_diarias`, `auditoria`                                | Vistas y contactos agregados por día, sin datos del visitante; registro de cambios.                                    |

## Verificación

`pendiente` → `fuente_oficial` (exige evidencia de fuente municipal o nacional, con enlace y fecha) → `confirmado` (exige evidencia; el negocio o municipio confirmó vigencia). Vencido `revisar_antes_de`, la vista pública lo muestra como `desactualizado` y una tarea programada lo marca. La base rechaza verificar sin evidencia.

## Seguridad

- RLS en todas las tablas. Los visitantes anónimos no leen tablas base: solo vistas filtradas (`fichas_publicas`, `espacios_publicos`, `rutas_publicas`, `planes_publicos`) y territorio/categorías/eventos publicados.
- Los negocios no editan fichas publicadas directamente: proponen solicitudes. No pueden marcarse fundadores, crear municipios ni escribir suscripciones.
- Suscripciones y documentos los escribe solo el servidor (webhooks del proveedor con `service_role`). **Nunca se guardan datos de tarjeta.**
- Ubicación del visitante: `lugares_cercanos` y `comuna_por_punto` no guardan nada; se llaman por POST para que las coordenadas no queden en URLs ni registros.
- Domicilios privados: `ubicacion_publica = false` oculta dirección y punto en lo público.
- Lo destacado pagado se expone como `destacado_rotulado` para mostrarlo siempre rotulado.
- Pendiente antes de producción: límite de frecuencia para `registrar_interaccion`, políticas del almacenamiento de fotos, carga oficial CUT y prueba en un proyecto Supabase real.

## Prueba local

`supabase/pruebas/probar-esquema.mjs` aplica la migración en Postgres local (PGlite + PostGIS) con una simulación mínima de Supabase y comprueba 28 casos: permisos de anónimo, dueño, tercero, moderación y servidor; verificación con evidencia; cercanía; URL canónica; IVA; factura con RUT; una suscripción vigente; rótulo de destacado y auditoría. Resultado del 16-11-2026: 28 de 28. Requiere `@electric-sql/pglite` y `@electric-sql/pglite-postgis` instalados aparte; aún no forma parte de la validación del repositorio.
