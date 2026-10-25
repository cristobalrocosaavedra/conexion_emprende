# Vistas de revisión 0.4

Capturas funcionales de la exportación web en Chromium móvil, previas a la APK. No son pruebas de GPS físico ni de instalación Android/iOS.

- [Inicio: región, provincia y comuna](pantalla-inicio.png). La Ligua se eligió manualmente; la interfaz distingue zona consultada de ubicación obtenida.
- [Mi viaje: ruta por calles y controles](pantalla-ruta.png).
- [Mapa con trazado del motor](pantalla-mapa.png).

Las últimas dos vistas usan una respuesta **real de OSRM local sobre calles públicas de Arica**, servida a la interfaz mediante un transporte simulado de prueba. El rótulo «Servidor propio conectado» corresponde a ese entorno de prueba, **no a un VPS público contratado**. No se utiliza ni simula una posición del teléfono. Los tiempos son estimaciones del extracto parcial. Las fichas continúan pendientes de verificación.

Si el fondo cartográfico no carga, se muestra su aviso y se conservan puntos y trazado; no se dibujan calles inventadas. El VPS real, cobertura nacional, HTTPS público y navegación física siguen pendientes de activación y prueba según [SERVIDOR-DE-RUTAS.md](../../SERVIDOR-DE-RUTAS.md).

La descarga de instalación tendrá una sola APK. Estas imágenes y el video de la versión anterior quedan en el repositorio; los datos de firma/checksum se conservan en un artefacto separado. GitHub Actions envuelve la APK de PR en un ZIP; la release revisada de develop permite descargar directamente el .apk.

Datos © Colaboradores de OpenStreetMap, ODbL 1.0; extractos y licencia accesibles desde el repositorio y la app. Límites Natural Earth en dominio público; ilustraciones de referencia, no fotografías verificadas.
