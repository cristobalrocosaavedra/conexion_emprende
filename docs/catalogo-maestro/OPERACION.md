# Ejecutar y revertir la simulación

Requisitos: Python 3.10 o posterior y las herramientas habituales del proyecto.
El importador utiliza solo la biblioteca estándar; no solicita claves, cuentas,
ubicación del viajero ni conexión de red.

## Reproducir el análisis

Desde la raíz del repositorio:

```sh
pnpm catalogo:simular
pnpm test:catalogo
```

Alternativa sin pnpm:

```sh
python3 scripts/catalogo/integrar.py simulate
python3 -m unittest discover -s tests/catalogo -v
```

Resultados en `content/staging/catalogo-maestro/simulacion`:

- `REPORTE.md`: resumen y coincidencias para revisión.
- `reporte.json`: totales, pendientes y decisión para cada una de las 737 filas.
- `desglose-region.csv`, `desglose-province.csv`, `desglose-commune.csv`: entrada,
  existentes, candidatos, coincidencias, conflictos y pendientes por territorio.
- `coincidencias.csv`: expediente exportable de los 24 posibles duplicados.
- `comunas-sin-atractivos.csv`: vacíos de cobertura de los insumos disponibles.
- `estado-propuesto.json`: estado candidato con fuentes, originales y evidencia
  por campo. Se genera localmente, queda fuera de Git y no se empaqueta en la app.

Las rutas que abarcan varios territorios cuentan en cada territorio afectado:
los subtotales de rutas por región/provincia/comuna no necesariamente se suman.
Todas las comunas y coordenadas del maestro requieren corroboración; «válida» en
el reporte significa únicamente coordenada numérica finita dentro del rango.

El ZIP y sus seis archivos se conservan íntegros en `entrada`/`original.zip`.
`respaldo/manifest.json` registra commit base, SHA-256 del paquete y hashes del
catálogo/código/recursos existentes. Los archivos respaldados se mantienen exactos;
las imágenes siguen recuperables desde ese commit. La simulación no escribe sobre
ningún archivo servido por la app. Los reportes son salidas reproducibles y no se
reformatean con Prettier; la documentación de esta carpeta sí se valida.

## Ensayar una carga local y su reversión

Estos comandos son opcionales para desarrollo; no fueron necesarios para publicar
nada y no conectan con producción. El CLI restringe sus escrituras a `trabajo/`,
fuera de los insumos y del respaldo.

```sh
python3 scripts/catalogo/integrar.py apply-staging \
  --state content/staging/catalogo-maestro/trabajo/estado.json \
  --journal content/staging/catalogo-maestro/trabajo/carga-001.json

python3 scripts/catalogo/integrar.py simulate \
  --state content/staging/catalogo-maestro/trabajo/estado.json \
  --output content/staging/catalogo-maestro/trabajo/segunda-simulacion

python3 scripts/catalogo/integrar.py rollback \
  --state content/staging/catalogo-maestro/trabajo/estado.json \
  --journal content/staging/catalogo-maestro/trabajo/carga-001.json
```

El segundo análisis debe dar cero nuevas entidades/afirmaciones para el mismo
material. El diario conserva el archivo previo y el hash posterior. Rollback
restaura sus bytes exactos, o elimina un estado que no existía. Se detiene si el
estado cambió después de la carga; nunca borra una edición posterior. Un diario
no se reutiliza para otra carga. Las pruebas ensayan ambos casos y rechazan
estados con registros marcados como publicados.

Este es un rollback del estado local, no una migración de una base que todavía no
existe. No hay comando de publicación productiva en el importador.

## Pendientes de fuentes oficiales

El 26-10-2026 la consulta CKAN de datos.gob.cl respondió correctamente y localizó:

- División Político Administrativa, ID `9ad2df52-b2f4-4250-ab16-28cb5a2edd6d`,
  que enlaza al ZIP SUBDERE 2020 y un MapServer oficial.
- Categoría Geoespacial: Límites y fronteras, ID
  `76d8a5e0-98dc-4444-8893-5511663badaa`, con referencia DPA 2023.

Se guardan las respuestas de descubrimiento como evidencia en `fuentes`. Eso no
sustituye descargar el CUT vigente ni verificar su licencia, códigos y jerarquía.
El conjunto DPA 2020 declara `cc-nc`; no se adopta esa licencia automáticamente
para otros archivos ni se considera resuelto el uso comercial.

La solicitud al ZIP indicado por el paquete para SERNATUR/MMA falló con
`curl: (56) CONNECT tunnel failed, response 403` antes de leer el servidor. Por eso
no se ejecutó una importación oficial ni se inventó un conteo. La licencia CCZero,
CRS EPSG:4326 y fecha mencionados en el adjunto siguen siendo **declaraciones del
paquete**, pendientes de verificar en el recurso oficial.

Para retomar la descarga en este entorno hay que revisar y guardar/publicar su
configuración de red, conservando los dominios existentes y añadiendo:
`lineasdebasepublicas.mma.gob.cl`, `www.subdere.gov.cl`, `www.ide.cl` y
`www.geoportal.cl`. No son cuentas de pago ni claves de la app. Una vez permitido
el acceso, se puede intentar el script preservado en `entrada/fuentes_auxiliares`;
antes de integrar su salida habrá que comprobar CRS, licencia, campos reales,
geometrías y relación de cada comuna con CUT. No convertir polígonos/centros en
accesos de carretera.

No se encontró el CSV original con localidades separadas por `|` dentro de este
repositorio ni del paquete. Se conservan las 63 localidades existentes y se
contrastan las 23 del maestro; no se afirma cubrir todos los pueblos de Chile.
