# Reutilización autorizada para la maqueta territorial

El 24-10-2026 el usuario pidió traer elementos de sus proyectos. Ante la segunda
confirmación explícita respondió: «quiero solo usar elelemntos de ellos, no quiero
modificarlos a ellos». Alcance aplicado: lectura y copia/adaptación a
conexion_emprende para esta ampliación. Los proyectos de origen no se modifican,
no se instalan dependencias ni se arrancan procesos en ellos.

| Origen                        | Revisión                                 | Elementos utilizados                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Matichoc/directorio_turistico | 4843e5c1aad8ec25371cb618304f528b74ababb1 | Datos literales de scripts/seed.ts: 37 referencias de lugares, 63 localidades y 3 recorridos; tres ilustraciones de rutas en public/rutas y logo de Matichoc en public/brand/matichoc-logo.webp |
| Matichoc/city_tour            | a31135cc9bc3d2ffd22b663d61ec30bcab26b3e2 | Cinco ilustraciones genéricas de public/ilustraciones, documentadas como IA en docs/IMAGENES.md; fórmula Haversine de src/lib/itinerary-engine/geo.ts                                           |

Se copian snapshots: la aplicación no importa código ni consulta datos de esos
repositorios durante ejecución, instalación o CI. No se ejecutó scripts/seed.ts ni
se consultaron credenciales o bases de datos. La extracción leyó exclusivamente
literales con el parser TypeScript, sin evaluar llamadas ni variables de entorno.
No se copiaron logos de terceros, contactos privados, tokens, fotos de terceros ni calendarios
como si fueran eventos vigentes. La reutilización de las ilustraciones está
amparada en la autorización del titular y en la documentación de procedencia.

## Tratamiento de la verificación

Todos los lugares pasan a pendiente en Territorio Vivo: la declaración de
verificado en el proyecto original no equivale a una nueva comprobación aquí.
Cada ficha conserva fuente cuando existe, fecha de importación y advertencia de
vigencia pendiente. Las coordenadas heredadas son referencias no comprobadas en
terreno. No se heredan horarios, precios ni tiempos de visita como promesas.

Dos excepciones explícitas:

- Túnel Las Palmas: la nota del origen dice Coquimbo, Los Vilos. Se corrige su
  clasificación territorial y se conserva como referencia del corredor histórico,
  no como lugar de la provincia de Petorca.
- Castillo del Diablo: referencia oral sin fuente pública ni ubicación confirmada.
  Se conservan nombre/descripción como referencia del titular; se eliminan las
  coordenadas del snapshot y no se publica un pin exacto.

Las paradas opcionales representadas como objetos en el origen se normalizan a su
ID; todas las paradas de los recorridos existen en el snapshot. Las duraciones
estimadas del seed no se copian. El mapa de viaje dibuja conexiones esquemáticas,
no carreteras ni navegación real.

## Otros recursos

- Cuatro fondos generados para Territorio Vivo, optimizados a WebP sin alterar
  su composición, suman aproximadamente 640 KB. Son ilustraciones genéricas de
  norte/centro/sur/austral, no fotografías de un lugar concreto ni 16 imágenes
  diferentes. Cada portada regional tiene nombre y contexto propios.
- Natural Earth: geometrías de las 16 regiones en dominio público. Fuente, hash
  y procesamiento en natural-earth.json. Vista continental simplificada, no
  cartografía oficial ni límites de precisión; no incluye Antártica ni islas lejanas.
- Leaflet 1.9.4: copia local de JS/CSS bajo BSD-2-Clause. Licencia íntegra en
  apps/mobile/src/vendor/LEAFLET-LICENSE.txt.
- Teselas visibles de OpenStreetMap: atribución permanente, identificación de la
  app y consultas solo del viewport. No hay descarga masiva, prefetch nacional ni
  paquete offline. Para una publicación de escala deberá revisarse proveedor y
  condiciones de https://operations.osmfoundation.org/policies/tiles/.

La ausencia de Internet afecta el fondo de teselas; las geometrías, referencias y
puntos se guardan con la app. No se promete mapa de calles completo sin señal.
La posición del viajero se utiliza únicamente al conceder el permiso de primer
plano; el geocodificador del sistema puede procesarla para determinar la región.
Solo se persisten región elegida, tema y IDs de paradas; no coordenadas del viajero.

Se retiraron menciones editoriales a patrocinios y al nombre del sitio de origen;
no se heredan auspicios ni relaciones comerciales a Territorio Vivo.

Por indicación expresa del usuario, Matichoc usa siempre como portada el logo o
un puesto/toldo real autorizado, nunca una tableta elegida automáticamente. Se
utiliza la copia del mismo diseño de logo disponible en public/brand del origen,
con fondo circular/transparente, contenida completa sobre blanco. El adjunto del
usuario muestra la variante cuadrada; no se afirma haber descargado ese archivo
local de Windows. La foto de producto se retiró de los recursos de la app.
