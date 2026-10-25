# Calles públicas para una prueba técnica

`arica.osm`: extracto derivado de la consulta Arica de `content/catalogo/osm-chile.json`, API OpenStreetMap, 24-10-2026. 1.252 nodos y 330 vías etiquetadas highway, sin identidades de colaboradores, sin contactos, sin fotografías. Se conservan solo etiquetas de circulación/nombre y nodos referenciados; no incluye relaciones completas ni representa una red apta para producción.

© OpenStreetMap contributors, ODbL 1.0: https://www.openstreetmap.org/copyright. Licencia completa en `content/sources/ODbL-1.0.txt`. Esta derivación abierta y los datos originales se incluyen para reproducir la prueba. No son datos inventados de negocios ni ubicaciones de viajeros.

`respuesta-arica.json`: respuesta real de OSRM 26.10.0-debian al procesar ese extracto; dos puntos públicos de prueba (-70.3129,-18.4783 y -70.310,-18.475). Se usa para comprobar parser, geometría y presentación. Sus 989 metros y cinco pasos son un resultado técnico del extracto parcial, no una recomendación turística ni una medición de un viaje real. No hay GPS de dispositivo en estos archivos.

`museos-arica.json`: segunda respuesta real del mismo motor/extracto, entre las coordenadas públicas de las dos referencias del catálogo en Arica. La interfaz recibe esta respuesta mediante un transporte simulado (`rutas.example.test`) para revisar la presentación sin un VPS público ni GPS real. Es una prueba técnica, no verificación de accesos o vigencia de las fichas.
