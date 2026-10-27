# Vistas funcionales 0.5.0

Capturas de Chromium móvil, no de una instalación Android física. La búsqueda se realiza desde Coquimbo y encuentra una ficha real de referencia en La Ligua, pendiente de verificación como el resto del catálogo.

- [Búsqueda nacional de Matichoc](pantalla-busqueda.png).
- [Ruta y controles para explorar el mapa](pantalla-mapa.png).
- [Inicio en La Ligua elegida manualmente](pantalla-inicio.png).

La vista de ruta usa la respuesta real local de Arica con transporte simulado; las lecturas de rumbo de la prueba son sintéticas, no de un dispositivo. La prueba verifica giro a 90°, mantenimiento de zoom manual frente a otra lectura GPS y conservación del trazado al actualizar la posición. La orientación física en Android/iOS se comprobará en los dispositivos.

MapLibre GL JS 5.24.0, BSD-3-Clause, distribución npm fijada y verificada por SHA-512; licencias propias y de terceros conservadas en src/vendor y dentro del documento del mapa. No se añade un SDK nativo, cuenta ni servicio de pago. Las teselas siguen siendo OSM; las rutas FOSSGIS/OSRM. La búsqueda y la vista no crean consultas de ruteo adicionales.
