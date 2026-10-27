# Maqueta 0.3 — navegación y referencias nacionales

El usuario probó satisfactoriamente la APK 0.2 y pide tres ajustes: gesto como una
lista del teléfono, selector que muestre las 16 regiones y un recorrido visible
por el país al elegir destino. No se activa backend ni monetización.

## Navegación acordada

- Dedo hacia arriba: avanzar hacia el sur. Dedo hacia abajo: volver hacia el norte.
  Los botones Norte/Sur siguen indicando el destino geográfico; la animación de
  salida/entrada acompaña al dedo. No cambia el orden territorial ni hay vuelta
  circular en los extremos.
- Selector con país central, enlaces alternados y líneas a las regiones. Las
  dieciséis entradas son visibles sin desplazar en 360 × 640 con tamaño de texto
  normal. Mantiene blancos de toque de al menos 44 puntos. El texto ampliado puede
  requerir desplazar para mantener lectura y accesibilidad.
- Al seleccionar una región, una línea y un indicador recorren los centros
  gráficos regionales. Se ve el origen, el destino, la región atravesada y el
  progreso. Duración de 1,1 a 3,6 segundos según distancia; reducir movimiento
  omite el recorrido. Se puede detener sin guardar regiones intermedias.
- Esta línea es una transición de navegación entre pantallas, no un cálculo de
  viaje por carreteras. Mi viaje mantiene sus conexiones esquemáticas previas.

## Catálogo

Se conservan las 37 referencias heredadas y se añaden 27 registros de
OpenStreetMap, repartidos entre las 16 regiones. Son consultas pequeñas de centros
urbanos, no cobertura exhaustiva de los atractivos del país ni un ranking de
recomendaciones. Un lugar en el mapa no confirma apertura, acceso ni contacto.

Los dos conjuntos se conservan separados en archivos y procedencia. Las fichas
nuevas indican referencia comunitaria, licencia y verificación pendiente. No se
copian fotos, horarios, precios, teléfonos ni calendarios. Las imágenes de esas
fichas siguen siendo ilustraciones genéricas, rotuladas como referencia.

Ver [investigación nacional](CATALOGO-NACIONAL.md) y
[procedencia OSM](../content/sources/OSM-CHILE.md). La asignación provincial y
comunal de los pequeños ámbitos urbanos se registra como clasificación editorial,
no verificación en terreno. Los centros calculados de elementos cartográficos
se distinguen de nodos puntuales y no prometen representar entradas.

## Entrega y compilación

Versión visible 0.3.0, mismo paquete y certificado que la APK base. CI conserva el
número incremental y compara con la versión anterior. La descarga de candidato
permite revisar antes de fusionar el PR; el canal compartido solo se actualiza
tras revisión/fusión del usuario a develop y checks verdes.

Se habilita escritura de caché Gradle para ejecuciones del propio repositorio y
el build cache de tareas. Los PR de forks mantienen caché de solo lectura. La
primera ejecución aún tiene que preparar resultados; la mejora de tiempo se debe
medir en otra ejecución con caché disponible. No garantiza que todas las tareas
nativas puedan reutilizarse.

El ZIP y la release incluyen el extracto OSM en JSON y el texto ODbL junto a la
APK y sus capturas. No se compila APK localmente. La exportación de iOS sigue
validada, sin afirmar build nativo de iPhone.
