# Codex — Consolidación del catálogo maestro de Territorio Vivo

## Objetivo
Usar `territorio_vivo_catalogo_maestro_consolidado.csv` como insumo de staging para consolidar las entidades existentes de Territorio Vivo en **una sola fuente de verdad**, preservando datos y relaciones actuales. No significa que deba existir una sola tabla física: mantener un catálogo y buscador unificados, con especializaciones para cada tipo de entidad.

## Qué hay dentro del paquete
- `territorio_vivo_catalogo_maestro_consolidado.csv`: **737 filas**: 346 registros de comuna, 368 registros de atractivo y 23 registros de localidad; cubre 16 regiones y 56 provincias, y las 346 comunas. Solo 63 atractivos tienen coordenadas suministradas. Las localidades adicionales del listado original en formato `|` no están completamente desglosadas en este maestro: **no asumir que el conjunto de pueblos está exhaustivamente incorporado**.
- `territorio_vivo_resumen_consolidacion.json`: conteos de control.
- `candidatos_16_regiones.csv`: base editorial auxiliar para contraste (no importar como una segunda base duplicada).
- `importar_sernatur_oficial.py` y `IMPORTACION_OFICIAL_SERNATUR.md`: vía para intentar obtener el inventario georreferenciado oficial. El inventario completo **no está descargado ni incorporado** al CSV maestro.

## Instrucciones imperativas
1. Antes de cambiar código o datos, inspecciona el repositorio real de **Territorio Vivo**, modelos/migraciones, mapas, búsqueda, proveedores y relaciones. No supongas motor de base de datos.
2. Trabaja en rama separada y entorno de desarrollo. Respaldar datos existentes; preparar migraciones reversibles. **No sobrescribir ni modificar producción sin autorización.**
3. Importa el CSV maestro a un área de staging. Validar UTF-8 con BOM, columnas, códigos territoriales, categoría, coordenadas (latitud -90..90; longitud -180..180), fuente, estado y tipo. Los valores vacíos no son coordenadas 0,0.
4. Cruza las 346 comunas con un catálogo oficial de códigos CUT SUBDERE, y verifica provincias/regiones antes de publicar. No inventar pueblos ni códigos.
5. Deduplica por identificador externo/fuente y luego por nombre normalizado + comuna + categoría + distancia cuando existan coordenadas. Nunca fusionar homónimos por nombre solamente. Registra posibles duplicados para revisión manual.
6. Conserva todos los datos ya existentes que sean más precisos o tengan verificación: teléfonos, fotos, dueños, reseñas, relaciones, geolocalización, horarios, etc. No degradar datos existentes al hacer merge.
7. El catálogo público debe ser uno, pero tener entidades tipadas: territorio (región/provincia/comuna/localidad), atractivo turístico, empresa/emprendimiento, gastronomía, alojamiento, experiencia/ruta, evento y categorías futuras. Los eventos tienen fechas y organizadores; los negocios datos comerciales; atractivos datos de acceso.
8. El estado de revisión es atributo del registro, no un catálogo aparte. `revisar` o `pendiente` no implica publicar. Mantén fuente y fecha de verificación por campo. Separa naturaleza pública del lugar, gratuidad, acceso práctico y tarifas.
9. Descarga, si es técnicamente viable, el inventario nacional georreferenciado oficial SERNATUR mediante el script adjunto, verifica licencia, CRS, atributos y registros, y confróntalo con el maestro. No anuncies como incorporados registros no descargados.
10. Descompón y verifica posteriormente todas las localidades contenidas en el CSV original del usuario (columna con separador `|`), si está disponible en el contexto del proyecto. El maestro actual no garantiza que esa expansión esté completa.
11. Entrega primero un **reporte de simulación** con totales existentes, nuevos, actualizados, posibles duplicados, conflictos, coordenadas válidas, comunas sin atractivos y pendientes de validación, desglosado por región/provincia/comuna.
12. Implementa un importador idempotente con pruebas y plan de rollback. Ejecuta publicación productiva únicamente tras aprobación expresa.

## Resultado esperado
Un catálogo consultable único para Territorio Vivo, organizado por jerarquía territorial, con mapa y búsqueda unificados, extensible sin migraciones destructivas a alojamientos, restaurantes, comercios, emprendedores, eventos y rutas.

**Importante:** los 737 registros son el contenido del CSV maestro entregado, no un catastro turístico nacional exhaustivo ni un inventario oficial íntegramente validado.
