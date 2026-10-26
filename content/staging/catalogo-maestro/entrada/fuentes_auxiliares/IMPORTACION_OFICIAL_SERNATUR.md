# Incorporación oficial SERNATUR/MMA para Territorio Vivo

**Estado actual:** script de descarga y normalización incluido; **los datos oficiales aún no están incorporados** porque el entorno de preparación no pudo acceder al ZIP. El script no modifica la aplicación ni publica información.

Fuente: https://lineasdebasepublicas.mma.gob.cl/datos_abiertos/dataset/atractivos-turisticos
Recurso GeoJSON ZIP (681,3 KiB según metadatos):
https://lineasdebasepublicas.mma.gob.cl/datos_abiertos/dataset/7aa4b072-c938-4c45-a31e-9d57c41c2713/resource/3bd18aad-1add-483c-af7f-d90e49f1e6d2/download/atractivos-turisticos_geojson.zip
Última actualización del recurso: 20 abril 2026. Fuente SERNATUR; publicación MMA; licencia CCZero; sistema geográfico EPSG:4326.

## Codex: instrucciones

1. Inspeccionar el repositorio **Territorio Vivo** (no confundir con Papudo en tu Mano). No crear tablas definitivas sin revisar el esquema existente.
2. Ejecutar desde esta carpeta `python importar_sernatur_oficial.py --salida staging_sernatur.csv`; alternativamente descargar ZIP manualmente y ejecutar `python importar_sernatur_oficial.py --archivo atractivos-turisticos_geojson.zip --salida staging_sernatur.csv`.
3. Leer `staging_sernatur.csv.reporte.json` para identificar campos reales, geometrías y cobertura. **No adivinar nombres de campos.** Cuando un nombre fuente no coincida con las alternativas del script, ajustar el mapa de campos usando el reporte.
4. Cruce con `candidatos_16_regiones.csv` y registros preexistentes mediante nombre normalizado + comuna + distancia cuando exista geometría puntual; generar informe de coincidencias y colisiones; no eliminar ni sobrescribir registros.
5. Retener las propiedades originales completas y provenance de cada registro. Puntos GeoJSON son **referencia**, nunca afirmar que son puerta de acceso. LineString/Polygon/MultiPolygon se mantienen como geometrías, **sin lat/lon de acceso inventados**.
6. Administración pública/privada no implica **gratuidad**. Dejar `acceso=Por verificar` salvo evidencia inequívoca por lugar.
7. Insertar primero a staging/drafts; solicitar revisión de seguridad, permisos, licencias y preview antes de publicar. Hacer migración reversible y pruebas de idempotencia.
8. Si la descarga falla, registrar error HTTP/DNS en reporte, no sustituir con un listado fabricado.

No se conoce por ahora el número real de registros oficiales hasta descargar el archivo; no inventarlo.
