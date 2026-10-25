# Rutas gratuitas durante las pruebas — 0.4.1

Decisión expresa del titular, 25-10-2026: usar temporalmente un servicio público rápido para probar rutas dentro de la app. Presupuesto vigente **US$0**. Esto sustituye la restricción anterior de usar únicamente un VPS propio sin logs. No se contrata alojamiento ni se crean cuentas o claves.

La aplicación usará `https://routing.openstreetmap.de/routed-car/`, servicio OSRM compartido mantenido por FOSSGIS. Una web y una APK pueden consultar el mismo motor: no necesitan cada una su VPS. La documentación del proveedor declara cobertura mundial de auto; permite evaluar trayectos entre regiones, sujeto a la red vial disponible. Un trayecto más largo no implica que debamos desplegar otro motor. No garantiza que todas las combinaciones tengan camino: islas, fronteras, ferris o carreteras sin conexión pueden dar NoRoute/NoSegment.

## Condiciones explicadas en lenguaje simple

- El proveedor recibe el origen, las paradas y el destino consultados. Si eliges iniciar desde tu ubicación, recibe esa coordenada. Su documentación dice que guarda las consultas en registros del servidor. No se promete privacidad equivalente al servidor propio.
- Máximo una consulta por segundo y sin uso intensivo ni extracción masiva. La app espacia cálculos al menos 1,2 segundos, agrupa ediciones con 1,5 segundos de espera y limita recálculos por desvío a uno cada 30 segundos tras dos lecturas fiables. No manda el GPS en cada actualización si el recorrido sigue vigente.
- Hay atribución a OSM, OSRM/FOSSGIS, enlace a las condiciones y a corregir el mapa. El cliente nativo identifica Territorio Vivo en User-Agent; el navegador conserva sus cabeceras permitidas y referencia web.
- El servicio es de pruebas: puede fallar, limitar consultas o retirarse. No se vende su acceso, no está detrás de pagos y no se adopta como infraestructura garantizada para el lanzamiento comercial. Revisar condiciones al monetizar o aumentar usuarios.

El viajero ve un aviso breve antes de los botones de cálculo y puede desactivar/reactivar las rutas. No introduce URL, cuenta, tarjeta ni configuración de VPS. El permiso del teléfono sigue siendo de primer plano; el seguimiento se pausa al salir de la app. La app no guarda coordenadas ni historial de movimiento en preferencias, analítica o logs. Las paradas guardadas conservan solo sus identificadores, como antes.

La navegación permanece dentro de Territorio Vivo: preview entre paradas, cálculo desde posición actual, inicio/detención, modificación y recálculo. La consulta del trazado se hace al pulsar la acción; abrir el catálogo o mirar el mapa no envía por sí solo una solicitud vial al proveedor. No se abre Google Maps. Se solicita carretera a menos de un kilómetro de cada punto para evitar trasladar silenciosamente una parada insular o aislada a una carretera lejana.

## Verificación y límites

Pruebas locales de cliente y UI usan una respuesta OSRM real de calles públicas de Arica con transporte simulado; se identifican como tales. La integración en Actions comprueba el servicio público real con dos consultas de puntos públicos ya presentes en el catálogo: La Ligua–Papudo y Santiago–La Serena. No usa ubicaciones de dispositivos. La APK solo se compila después de pasar esas comprobaciones. Un resultado correcto es una prueba puntual, no una garantía de disponibilidad continua ni una prueba física de navegación GPS.

El entorno de Codex tiene una lista de red independiente de la red del teléfono y del runner de Actions. Los dominios del servicio se guardaron en el borrador de configuración; su aplicación en Codex requiere guardar/publicar los ajustes. No se elude la política ni se envía GPS a través de proxies auxiliares.

Para viajes largos se admite geometría de hasta 250.000 vértices y respuestas de hasta 32 MB; el mapa recibe de nuevo el trazado solo cuando cambia, no con cada posición. Se conserva en memoria y se libera al detener. Los tiempos siguen siendo estimaciones sin tráfico en vivo. Servidor propio, mapas propios y condiciones para producción se evaluarán según necesidad y presupuesto; los archivos infra/routing quedan como preparación futura.

## Fuentes

Consultado el 25-10-2026 el documento del propio operador:
https://github.com/fossgis-routing-server/routing-chef/blob/master/cookbooks/osrm/files/default/about.md

Explica registros, identificación, máximo una consulta por segundo, atribución y enlace a correcciones. Enlaces completos vigentes del operador:

- https://routing.openstreetmap.de/about.html
- https://www.fossgis.de/arbeitsgruppen/osm-server/nutzungsbedingungen/
- https://www.fossgis.de/datenschutzerklärung

El acceso directo desde Codex a esos sitios continúa pendiente de aplicar el borrador de red. No se afirma haber leído páginas que no se pudieron descargar. Las condiciones verificadas aquí proceden del documento oficial del operador alojado en GitHub; las políticas pueden cambiar.
