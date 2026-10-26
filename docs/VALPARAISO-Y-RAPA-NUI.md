# Valparaíso: total regional, comuna y destinos insulares

26-10-2026. La versión 0.6 mostraba el nombre de la región y el contador de la
comuna activa en la portada. Valparaíso tenía **86 referencias**, pero con La Ligua
seleccionada aparecían **11**, sin distinguir de forma suficiente el ámbito del
número. No se habían eliminado fichas de la región.

## Comportamiento de 0.6.1

La portada muestra el total regional y, debajo, el total de la comuna. El botón
**Ver toda la región** limpia comuna/búsqueda/categoría al entrar a explorar. La
selección local del GPS y la prioridad de lugares de la comuna se conservan.

Se agregan cuatro referencias comunitarias pendientes en Rapa Nui:

| Referencia                                         | Origen                                       |
| -------------------------------------------------- | -------------------------------------------- |
| Anakena                                            | https://www.openstreetmap.org/way/26273549   |
| Ahu Tahai                                          | https://www.openstreetmap.org/way/222144438  |
| Ahu Toŋariki (también buscable como Ahu Tongariki) | https://www.openstreetmap.org/way/221696391  |
| Museo Antropológico Padre Sebastián Englert        | https://www.openstreetmap.org/way/1459388783 |

Valparaíso pasa a **90 referencias**; La Ligua conserva **11**. El total nacional
pasa a 433 fichas. Rapa Nui no se incorpora como otra región: pertenece a
Valparaíso y su comuna en el maestro es Isla de Pascua. Se puede buscar también
por Rapa Nui y entrar directamente desde la portada regional.

Los datos proceden de tres consultas acotadas a OpenStreetMap, con hashes,
objetos/versiones y extracto geométrico en `content/sources/rapa-nui`. Licencia
ODbL 1.0 y atribución conservadas. Se eliminaron identidades de colaboradores del
extracto. Las coordenadas son centros de los elementos cartográficos; no se
certifican accesos, horarios, apertura, tarifas ni permisos de visita. Las
ilustraciones siguen identificadas como genéricas, no fotografías de los lugares.

La referencia histórica de SERNATUR consultada el 26-10-2026 identifica el acceso
aéreo por Mataveri y la pertenencia regional. Se enlaza expresamente como
publicación de 2022; no se presentan sus requisitos sanitarios, frecuencias ni
reglas de ingreso antiguas como actuales. La app recomienda consultar vuelos y
requisitos vigentes antes de viajar.

## Recorridos separados

Los destinos insulares se pueden guardar. Mi viaje conserva todos los IDs y
permite elegir el recorrido del continente o el de Rapa Nui, con sus cantidades.
No se traza ni se calcula una conexión en auto a través del océano. El traslado
aéreo queda fuera del motor vial; no hay reservas ni horarios de vuelos inventados.

En Rapa Nui se puede explorar el mapa local y preparar el recorrido entre sus
paradas sin usar GPS. Para iniciar navegación desde ubicación hay que estar en
esa zona. Un inicio desde el continente hacia paradas de la isla falla localmente
antes de enviar la consulta vial. El seguimiento es de primer plano y no guarda
coordenadas. En un cambio manual de recorrido se detiene la navegación anterior.

Hay protección en tres capas: selección de paradas por ámbito, validación del
origen/waypoints antes de consultar OSRM y esquemas cartográficos separados por
ámbito. El reordenamiento conserva los destinos de otros recorridos. El mapa
regional se centra en el continente y el mapa de Rapa Nui aparece al elegir su
zona; no se achica todo Chile para encajar la isla en el mismo viewport.

Los rectángulos técnicos usados para reconocer ámbitos insulares son reglas de
conectividad, no polígonos oficiales CUT. Permiten resolver Rapa Nui desde una
posición consentida aun si falla el geocodificador, sin fabricar límites
administrativos. Juan Fernández también queda en un ámbito disjunto, aunque no se
inventan fichas de sus atractivos en esta entrega.

## Excel y comprobaciones

El checklist actualizado tiene **921 entidades**. El lector sigue admitiendo el
Excel 0.6 de 917 entidades: conserva sus respuestas y señala los cuatro registros
nuevos como todavía pendientes. Los manifiestos de las versiones están en
`content/staging/catalogo-maestro/checklists`; no se confía en un manifiesto
alterado dentro del archivo devuelto. Si un dato actual cambió desde la edición
del Excel se informa como conflicto, sin reemplazarlo automáticamente.

Pruebas cubren conteos región/comuna, búsqueda de Rapa Nui, mapa con cuatro
referencias, conservación de destinos separados, rechazo de inicio desde GPS
continental sin consultas de ruteo y devolución del Excel anterior. En Actions se
comprueban rutas reales entre La Ligua/Papudo, Santiago/La Serena y Anakena/Ahu
Toŋariki, usando puntos públicos y nunca ubicaciones de viajeros. La cobertura
real del proveedor en Rapa Nui se informa según esa ejecución, sin sustituirla por
una respuesta artificial. Una prueba de servidor no equivale a navegación física
en un teléfono en la isla.
