# Catálogo basal nacional — fuentes y estado real

24-10-2026. El usuario solicita comenzar una base para todas las regiones con directorios públicos. Esta entrega prepara el inventario y criterios. **No hay registros turísticos reales descargados o incorporados todavía.**

## Consultas realizadas

| Fuente candidata          | URL consultada                                                           | Uso por investigar                                                                 | Resultado observado                                           |
| ------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| SERNATUR                  | https://www.sernatur.cl/registro-de-prestadores-de-servicios-turisticos/ | Registro de prestadores, disponibilidad de exportación y permisos de reutilización | Proxy: túnel 403; contenido y licencia no examinados          |
| Datos abiertos del Estado | https://datos.gob.cl/api/3/action/package_search?q=turismo&rows=3        | Descubrir conjuntos turísticos, metadatos y licencias por recurso                  | Proxy: túnel 403; catálogo no leído                           |
| OpenStreetMap             | https://www.openstreetmap.org/copyright                                  | Condiciones, atribución y obligaciones antes de extraer puntos                     | Proxy: túnel 403; no se extrajeron datos                      |
| Chile Cultura             | https://chilecultura.gob.cl/                                             | Investigar información cultural/eventos, su vigencia y vía de reutilización        | Proxy: túnel 403; existencia de API/exportación no comprobada |

Un 403 de túnel ocurre antes de leer el servidor de destino: no demuestra que el sitio no exista, que haya rechazado al usuario ni que necesite una clave. Tampoco confirma que los endpoints anteriores estén vigentes. No se intentó eludir el bloqueo ni desactivar TLS.

Se guardaron requisitos de red para www.sernatur.cl, datos.gob.cl, www.openstreetmap.org y chilecultura.gob.cl, además de docs.expo.dev para documentación de desarrollo. El guardado no los aplica al proceso en ejecución; cuando cambie la política se repetirán las consultas antes de dar una fuente por utilizable.

## Orden de incorporación propuesto

1. División administrativa nacional: IDs, nombres, pertenencia región/provincia/comuna y geometrías. Seleccionar una publicación oficial y revisar licencia, versión y precisión. Fuente concreta todavía pendiente; no tratar el mapa generado como esa fuente.
2. Prestadores de turismo: buscar exportaciones públicas de SERNATUR o datos.gob.cl y condiciones. No copiar masivamente un directorio por el solo hecho de ser visible.
3. Lugares y servicios básicos: evaluar datos OpenStreetMap con procedencia y obligaciones de atribución. No mezclar extracción OSM con datos de otras licencias sin revisión.
4. Eventos: priorizar organismo y anuncio original, vigencia y cancelaciones. Una agenda antigua no prueba que un evento vaya a ocurrir de nuevo.
5. Otras pymes y emprendimientos: fuentes con permiso o altas propias cuando se autorice esa fase. No se asume que un directorio turístico represente todo el comercio.

## Metadatos obligatorios

Por fuente: organismo, URL de origen, recurso concreto, licencia y evidencia, versión/fecha, campos reutilizables y restricciones. Registrar fecha de consulta/descarga, checksum y atribución requerida. Por ficha: identificador de origen, fuente, actualización disponible, territorio, precisión geográfica y estado de verificación por la plataforma.

Validar duplicados, estado activo, coordenadas, pertenencia territorial y contacto público de negocio. Separar dirección pública de atención de domicilio privado. La disponibilidad pública de información personal no autoriza todos sus usos. Evitar descargar documentos personales o teléfonos particulares para poblar una maqueta. No reutilizar fotografías sin permiso comprobado.

Un registro importado puede mostrarse como «Fuente pública · sin verificar por Territorio Vivo» solo si licencia y calidad permiten publicarlo. Conservar el tipo de verificación que la fuente realmente declara, sin afirmar equivalencia con nuestra revisión. No marcar automáticamente «verificado» por existir en Google o SERNATUR.

## Publicación y cercanía

La pantalla puede presentar la región completa y priorizar comuna/provincia según ubicación consentida, sin guardar coordenadas del viajero. «Cercano» requiere ubicación suficiente; si solo se conoce región, usar una etiqueta regional. No llamar cercano a un contenido seleccionado únicamente por ranking o publicidad.

Las regiones sin base todavía muestran «Sin información disponible» o ejemplos en un modo de demostración claramente separado. No inventar negocios para completar cobertura. No prometer cobertura nacional por haber cargado una lista de regiones.

## Otros repositorios

city_tour y directorio_turistico no se consultaron ni modificaron para esta investigación. Reutilizar sus referencias queda pendiente de las dos confirmaciones explícitas requeridas por trabajo, y de revisar procedencia/licencias de los materiales que se quiera copiar. No son dependencias de Territorio Vivo.
