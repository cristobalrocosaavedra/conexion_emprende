# Maqueta territorial 0.2

La primera APK permitió probar el cascarón. Esta ampliación aplica la dirección
visual V02 al producto interactivo y usa elementos propios autorizados por el
usuario en dos confirmaciones, sin modificar los repositorios de origen.

## Qué cambia

- El gesto vertical funciona en toda la ventana regional, incluida la zona de
  tarjetas y acciones. Hacia arriba va al norte y hacia abajo al sur; un gesto
  horizontal mantiene el carrusel de tarjetas. En los extremos no hay navegación
  circular. El salto del selector muestra las regiones intermedias y respeta
  reducir movimiento.
- Las 16 regiones tienen contexto propio y comparten cuatro fondos de grandes
  zonas generados para esta app, optimizados a unos 640 KB en total.
- El selector usa límites simplificados de Natural Earth (dominio público).
  Incluye mapa y lista; no reemplaza cartografía oficial ni muestra islas lejanas
  o Antártica como si estuvieran en el continente.
- Explorar tiene filtros por comuna/categoría, búsqueda, mapa con puntos y fichas
  con descripción, fuente, fecha de importación y estado pendiente.
- Se reutilizan 37 referencias de lugares, 63 localidades y 3 recorridos. Una
  referencia del corredor pertenece a Coquimbo y se clasifica allí; una referencia
  oral sin ubicación confirmada no recibe coordenadas ni pin.
- Mi viaje permite guardar, quitar, reordenar y cargar las paradas de un recorrido;
  muestra conexiones e ida/vuelta. Conserva IDs de paradas, región y tema entre
  aperturas. No guarda coordenadas del viajero.
- Las fichas de Matichoc usan la foto de producto propia conservada en el
  directorio; el resto de las imágenes genéricas se identifica como ilustración.
- Ubicación con permiso de primer plano para identificar región con el
  geocodificador del sistema; se puede seguir manualmente. Si ya existe permiso,
  se intenta reconocer región al abrir, sin reemplazar una elección posterior.

## Qué es real y qué es demostración

Los lugares son referencias reales heredadas, sin nueva verificación en terreno
ni de vigencia. No se hereda automáticamente el badge verificado del proyecto
original. Castillo del Diablo se presenta como referencia del titular sin fuente
pública comprobada y sin pin. Los textos y coordenadas pueden requerir corrección.

Las rutas son propuestas heredadas; sus líneas conectan paradas de manera
esquemática. Los kilómetros son de conexión en línea recta, no distancia por
carreteras. No se calculan tiempos, accesos ni navegación vial. Se descartaron las
duraciones del seed de origen para evitar presentar estimaciones como resultados.

Eventos incluye tarjetas de demostración interactivas, sin fechas ni agenda real
inventadas. Las regiones sin catálogo propio tienen portada y mapa, e indican que
sus fichas están en preparación. No se anuncia cobertura nacional de negocios.

## Mapas y conexión

Leaflet y límites/puntos se incluyen localmente. La WebView de Android/iOS utiliza
el motor del sistema; no se empaqueta un navegador Chrome completo. El mapa de
calles usa teselas de OpenStreetMap solo del área visible, con atribución e
identificación de la app. Requiere Internet. Ante fallo, conserva geometrías y
puntos y explica que el fondo no cargó. No se descargan regiones offline.

Para revisar las teselas desde el entorno de desarrollo se guardaron en borrador
los destinos tile.openstreetmap.org y operations.osmfoundation.org; la consulta
inicial fue bloqueada por el proxy. El teléfono usa su propia conexión. Ver
content/sources/REUTILIZACION.md y las condiciones del servicio antes de escalar.

## Android e iOS

Versión 0.2.0; en CI el número incremental es 100000 + número de ejecución.
El valor local de configuración es 2, sin compilar APK local. El proyecto genera APK
solo en GitHub Actions; no se compila APK local. Se conservan identificador y firma
pública de pruebas de la maqueta anterior. La actualización de permisos solicita
ubicación solo al usar esa opción y nunca en segundo plano. El módulo se exporta
para iOS también; su build nativo y distribución requieren su entrega específica.

Pruebas: lógica y catálogo con Vitest y flujos de interfaz con Playwright/Chromium
móvil. La prueba del mapa aborta teselas para verificar funcionamiento de puntos
sin conexión externa. La instalación y los permisos reales de Android deben
probarse en el teléfono tras generar el artefacto.

El flujo de actualización, vistas previas y canal compartido está en
[ACTUALIZACIONES.md](ACTUALIZACIONES.md).
