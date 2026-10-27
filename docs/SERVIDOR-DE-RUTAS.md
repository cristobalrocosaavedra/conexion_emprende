# Servidor propio de rutas — preparación futura

**Decisión vigente, 25-10-2026: presupuesto US$0 y servicio público temporal para pruebas, autorizado por el titular.** Ver [RUTEO-PUBLICO-DE-PRUEBAS.md](RUTEO-PUBLICO-DE-PRUEBAS.md). No hace falta contratar ni configurar este VPS para la candidata 0.4.1. Lo que sigue conserva la preparación de la alternativa propia para más adelante.

Decisión del titular, 24-10-2026: navegación dentro de Territorio Vivo, sin abrir Google Maps; motor en un VPS nuevo, separado y sin registros de ubicación. **No se ha contratado ni desplegado un VPS.** Los archivos de `infra/routing` son una instalación preparada para revisión, no un servicio público activo.

La APK contiene la interfaz y el cliente de navegación. Las calles las calcula OSRM con datos de OpenStreetMap en el servidor; cambiar una parada no exige otra APK. La ubicación y la geometría del viaje permanecen en memoria del cliente y se envían al motor por HTTPS únicamente para calcular/recalcular; no se guardan en preferencias. La única configuración nueva persistida es la dirección pública del servidor. No hay servidor público de respaldo.

## Instalación propuesta y presupuesto

Un VPS Linux x86_64 dedicado, Ubuntu 24.04 LTS, 4 vCPU, 16 GB RAM y **160 GB SSD** es la propuesta inicial para la beta. Es un dimensionamiento a medir con el grafo nacional y carga real, no una garantía de capacidad: el procesamiento puede requerir temporalmente más RAM/disco. Mantener presupuesto para ampliar; no contratar un plan anual antes de medir. Los límites del contenedor OSRM dejan espacio para el sistema.

Reservar orientativamente **US$25–60 al mes** para este VPS, más impuestos, respaldos y transferencia que exceda el plan; **US$5–15 adicionales** para contingencia/respaldos. Son reservas de presupuesto, no tarifas comprobadas de un proveedor. Contrastar precio final, ubicación del datacenter, IPv4, tráfico incluido y condiciones antes de comprar. Elegir preferentemente una ubicación cercana a Chile si latencia y costo lo permiten. Este monto no incluye Supabase, catálogo, imágenes, moderación, tiendas ni trabajo humano: ver COSTOS-Y-MONETIZACION.md.

La primera medición usa unas calles públicas de Arica. No representa el tamaño, duración de preparación ni capacidad de Chile entero. Chile solo puede no incluir conexiones que atraviesan Argentina; ante falta de camino se muestra un error, nunca una línea recta como ruta. Islas, ferris, restricciones, fronteras y accesos deben revisarse. Sin tráfico en tiempo real, voz ni navegación en segundo plano en esta versión.

## Pasos manuales, en orden

1. Elegir proveedor y aprobar el costo mensual. Crear la cuenta directamente en su web; no enviar contraseñas, tarjeta ni claves por el chat. Contratar el VPS **solo después** de esa decisión. No usar servidores de los otros proyectos.
2. Crear el servidor con los recursos anteriores y Ubuntu. Configurar acceso SSH con clave en el proveedor, actualizaciones de seguridad y cortafuegos: SSH restringido al administrador; puertos públicos 80 y 443. No abrir el 5000 ni el 8080 de Docker. Verificar también las reglas del cortafuegos del proveedor: Docker puede eludir reglas UFW locales.
3. Instalar Docker Engine y Compose siguiendo su guía oficial para Ubuntu. Desactivar swap persistente y volcados de memoria para los procesos de navegación; no instalar APM, captura de peticiones ni agentes que registren URL/cuerpo de consultas. Los respaldos deben incluir configuración y mapas, nunca memoria o tráfico. Revisar con el proveedor si tiene registros de tráfico o captura de contenido; no prometer ausencia absoluta de metadatos de red del proveedor.
4. Preparar un nombre técnico como `rutas.tu-dominio.cl` apuntando directamente a la IP del VPS. No requiere decidir la marca de la app. Puede ser un subdominio de un dominio existente autorizado o un nombre DNS del proveedor apto para certificados públicos. **Sin proxy CDN que descifre las consultas.** Si todavía no existe un nombre utilizable, habrá que configurar DNS antes de conectar Android/iOS; no se permite HTTP inseguro.
5. Descargar este repositorio autorizado al VPS y entrar a `infra/routing`. Copiar `.env.example` a `.env` y cambiar únicamente `ROUTING_HOST` por ese nombre público. Los archivos `.env` no se suben a GitHub. Esta dirección no es una contraseña.
6. Descargar el extracto Chile `.osm.pbf` desde la fuente oficial de Geofabrik: `https://download.geofabrik.de/south-america/chile.html`. Comprobar el checksum ofrecido y registrar fecha, URL y hash SHA-256 local. Revisar atribución/ODbL; no reutilizar una descarga incompleta. El script no descarga ni procesa datos nacionales por sorpresa.
7. Ejecutar `bash prepare.sh /ruta/al/chile-latest.osm.pbf`. Solo procesa el mapa público, sin GPS de usuarios. Puede tardar; verificar memoria y espacio. Si falla, no iniciar la app contra un grafo parcial. Los tres procesos deben terminar correctamente. Para renovar mapas, preparar otro directorio y sustituirlo durante mantenimiento; no sobrescribir el grafo en servicio.
8. Ejecutar `docker compose config --quiet` y `docker compose up -d`. Caddy obtiene el certificado HTTPS automáticamente. Dejar abiertos 80/443 para su renovación. Los errores de solicitudes no se registran: diagnosticar salud/configuración con consultas públicas, nunca activar logs con viajes reales para depurar.
9. Comprobar `/capabilities` y `/healthz` por HTTPS. Después probar dos puntos públicos conocidos de distintas zonas, ida y vuelta y un caso sin conexión vial. Auditar que los tres contenedores usan `logging.driver=none`, `core=0`, que OSRM tiene `--verbosity NONE`, Nginx `access_log off`/`error_log /dev/null`, y Caddy `output discard`. Revisar también servicios externos, firewall y monitoreo; no pegar una configuración completa con secretos en el chat.
10. En la beta: abrir **Mi viaje**, agregar paradas y pegar el HTTPS en **Conectar el servidor de esta prueba**. La app comprueba identidad declarada, configuración y salud **sin enviar GPS**. Esta declaración no demuestra por sí sola la privacidad: debe haberse auditado la instalación del paso anterior. No sirve pegar el servidor de demostración OSRM; la app lo rechaza.
11. Pulsar **Ver entre mis paradas** para revisar calles sin ubicación del teléfono, o **Iniciar ruta** para navegar desde la posición actual. Aceptar **Mientras usas la aplicación** y ubicación precisa. Si se elige **Solo esta vez**, el sistema puede volver a preguntar al reabrir. Si se denegó permanentemente, abrir los ajustes del teléfono. No se solicitan permisos de administrador del dispositivo ni ubicación permanente en segundo plano.
12. Probar la actualización instalada encima de la 0.3, retención de paradas, GPS físico en La Ligua, desvío controlado y modificación de paradas. La firma y el identificador se conservan; no borrar la instalación anterior como procedimiento normal. La validación en Chromium no sustituye esta prueba Android ni una prueba nativa iOS.

## Privacidad y límites concretos

Caddy termina TLS en el VPS; gateway Nginx solo admite salud, configuración y rutas en auto, con límites de consultas por IP en memoria. OSRM solo se publica en la red interna de Docker. Los tres procesos descartan registros, el driver de Docker no escribe stdout/stderr y los core dumps están desactivados. Los mapas son datos públicos y pueden persistirse; los viajes no. No se envían claves del servidor al cliente.

En Android/iOS el seguimiento es de primer plano y se retira al salir de la app o detener el viaje. Se conserva un punto actual, avance y origen de regreso en memoria, sin historial. Las respuestas anteriores se invalidan al editar o detener; no debe resucitar una ruta cancelada. La estimación depende del mapa instalado, no sustituye señalética y restricciones vigentes.

El mapa base todavía descarga teselas OSM: el proveedor de teselas puede observar qué áreas se consultan y la IP. El geocodificador del sistema puede procesar la posición para obtener comuna/región. Son servicios distintos del motor propio; no se anuncia privacidad total de todos los terceros. La región tiene resolución local de respaldo. Migrar mapas a PMTiles/servicio propio sigue en el plan posterior.

La configuración sin logs pierde diagnósticos detallados deliberadamente. Medir salud y recursos agregados, sin URLs de rutas, parámetros, cabeceras ni cuerpos. Si se cambia proveedor, proxy o monitoreo, repetir la auditoría antes de conectar GPS real.

## Referencias técnicas

- OSRM oficial: https://github.com/Project-OSRM/osrm-backend (imagen 26.10.0-debian fijada por digest en Compose).
- Nginx y Caddy oficiales: imágenes fijadas por digest, sin etiquetas flotantes.
- El servicio público FOSSGIS declara guardar consultas en logs: https://github.com/fossgis-routing-server/routing-chef/blob/master/cookbooks/osrm/files/default/about.md. Por eso no es respaldo para el GPS de esta app.
- Datos OSM: https://www.openstreetmap.org/copyright. Licencia ODbL ya conservada en `content/sources/ODbL-1.0.txt`.
