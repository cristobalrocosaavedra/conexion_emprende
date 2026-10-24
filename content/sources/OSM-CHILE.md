# Extracto comunitario de OpenStreetMap

Archivo independiente: [osm-chile.json](../catalogo/osm-chile.json).
Fecha de consulta e importación: 24-10-2026. Contiene 27 registros en las 16
regiones, obtenidos mediante consultas pequeñas de centros urbanos a la API
pública de OpenStreetMap. Las consultas, bounding boxes y hashes SHA-256 de las
respuestas están en `queries`; cada referencia conserva tipo, ID, versión y fecha
del objeto original. No se incluyen identidades de colaboradores ni contactos.

## Procedencia y selección

Se seleccionaron hasta dos elementos con nombre y etiqueta tourism museum,
gallery, attraction o viewpoint por ámbito consultado. En Coyhaique se conserva
solo una de las dos referencias de ferias próximas, evitando presentarlas como
dos destacados distintos sin revisión. No se incluyen nombres genéricos como
Mirador ni se crean puntos para completar cupos. El orden no representa calidad,
interacciones, patrocinio ni una recomendación editorial.

Nodos: se conservan las coordenadas publicadas. Ways: se utiliza la media de los
vértices disponibles como centro cartográfico aproximado; solo se acepta una
geometría completa y con centro dentro del ámbito consultado. La precisión se
identifica como osm-node-unchecked u osm-feature-center-unchecked. No equivale a
acceso visitable, entrada del recinto ni posición confirmada en terreno.

Región/provincia/comuna se asignan al pequeño ámbito urbano consultado y se
mantienen como clasificación editorial pendiente de revisión. El extracto no es
un directorio de todo el territorio de esas regiones. No se copiaron descripciones,
fotografías, horarios, precios, contactos, nombres de colaboradores o verificaciones
externas. El texto de advertencia de la interfaz es propio y localizado.

## Licencia y distribución

Datos © Colaboradores de OpenStreetMap. El extracto y sus adaptaciones se ofrecen
bajo **ODbL 1.0**, que permite uso comercial cumpliendo sus condiciones. Se revisó
https://www.openstreetmap.org/copyright. Texto íntegro en
[ODbL-1.0.txt](ODbL-1.0.txt), obtenido de la lista SPDX:
https://raw.githubusercontent.com/spdx/license-list-data/main/text/ODbL-1.0.txt.

Se conserva este conjunto separado del catálogo heredado de Petorca y del código.
La aplicación consulta ambos conjuntos con el mismo contrato; no se relicencian
las descripciones ni las imágenes del catálogo anterior como si fueran OSM.

Atribución y licencia visibles en fichas y catálogo. El mismo JSON usado por esta
versión y su licencia se adjuntan a la descarga del candidato y a los assets de la
release, sin cobrar por el acceso al extracto ni restringir su redistribución bajo
ODbL. Para una distribución por tiendas se deberá mantener una oferta accesible
del extracto correspondiente a cada versión antes de lanzar; no basta un enlace
a un repositorio privado ni solo al mapa original.
