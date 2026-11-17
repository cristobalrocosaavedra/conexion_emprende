# Turismo en tu Mano — propuesta de sitio web

Estado: propuesta para revisión, versión 2 (17-11-2026). Nada de esto está implementado.
Los esquemas mostrados en la conversación y las imágenes que salgan de GPT son
**ilustraciones de diseño**, no capturas funcionales.

## Idea central

La lógica de la app se mantiene: **el sitio te ubica en tu región** y todo gira en torno
al territorio donde estás. Lo que cambia es que en la web cada territorio es una página
propia, con dirección, pestañas y enlaces visibles, en vez de gestos.

- Orden territorial: **Región → Provincia → Comuna → Ficha**.
- En cada región, provincia y comuna hay tres pestañas: **Qué hacer**, **Explorar** y
  **Negocios**. No son secciones sueltas del menú: siempre se refieren al territorio
  en el que estás.
- **Ficha única**: lugar y negocio usan la misma página. Se llega a ella desde Qué hacer,
  desde el mapa de Explorar, desde Negocios o desde el buscador. Si es un negocio con
  plan, la ficha muestra además contacto, fotos y su sello de plan rotulado.
- **Mi ruta** acompaña todo el sitio: se van sumando paradas desde cualquier región y
  se ve el viaje completo, incluso entre regiones.
- **Comercial** (Suma tu negocio, Planes) es la parte de venta.
- **Panel privado** es la administración: municipios, negocios y equipo. No es parte del
  sitio público.

## Barra fija (en todas las páginas)

- Logo · **«📍 Estás en Región de Valparaíso ▾»** · buscador · **Mi ruta (n)**.
- Al entrar por primera vez: botón «Usar mi ubicación» (con permiso del navegador) o
  elegir región en el selector. Se recuerda solo la región elegida, nunca coordenadas.
- Migas con selector en cada nivel: «Valparaíso ▾ › Provincia de Petorca ▾ › La Ligua ▾».
  Cada ▾ abre las vecinas del mismo nivel, para cambiar de comuna o región sin volver atrás.
- En región: enlaces grandes «↑ Norte: región anterior · Sur: región siguiente ↓» y
  teclas ↑/↓. Equivale a los gestos de la app, sin hacerlos obligatorios.

## Recorrer con scroll (decisión del 17-11-2026)

Diseños aprobados en `docs/web/disenos/` (ver su README con los ajustes). Cada página y
cada pestaña es una página web completa que se baja con scroll: las imágenes muestran
solo la parte de arriba. Al bajar, la barra superior y la fila de pestañas quedan fijas;
en celular, la barra inferior con «Mi ruta» también. Cada pestaña tiene su dirección,
así que el botón «atrás» del navegador y los enlaces compartidos funcionan.

## Planes y mapa (decisión del 17-11-2026)

- **Presencia ($9.990 + IVA):** ficha con datos, dirección y contacto. No aparece en el mapa ni se puede sumar a rutas.
- **Completo ($24.990 + IVA):** además, ubicación en el mapa y opción de sumarse a Mi ruta y a las rutas. Es la diferencia clave.
- **Destacado ($39.990 + IVA):** Completo más espacio destacado rotulado.

## Mapa del sitio

| Página                                      | Dirección                                            | Contenido                                                                                                                                                                            |
| ------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inicio                                      | `/`                                                  | Portada con logo, «Chile, en la palma de tu mano», buscador, Chile de norte a sur (4 zonas, 16 regiones), tu región destacada si la elegiste, negocios fundadores, llamado a sumarse |
| Región                                      | `/region/valparaiso`                                 | Portada ilustrada rotulada, provincias, pestañas, paso norte/sur                                                                                                                     |
| Provincia                                   | `/provincia/petorca`                                 | Comunas de la provincia, pestañas                                                                                                                                                    |
| Comuna                                      | `/la-ligua`                                          | Pestañas, espacio comunal si hay acuerdo municipal                                                                                                                                   |
| Qué hacer                                   | `/la-ligua/que-hacer` (igual en región y provincia)  | Panoramas para hoy, rutas del día armadas (a pie / en auto, duración, paradas), por tipo, «Agregar todo a Mi ruta»                                                                   |
| Explorar                                    | `/la-ligua/explorar`                                 | Mapa del territorio con íconos por categoría, ubicación con permiso, cómo llegar                                                                                                     |
| Negocios                                    | `/la-ligua/negocios`                                 | Fichas comerciales del territorio, destacados rotulados                                                                                                                              |
| Ficha única                                 | `/la-ligua/nombre-del-lugar`                         | Foto autorizada o logo completo, verificación con fuente y fecha, descripción, mini mapa, cómo llegar (a pie / en auto), agregar a Mi ruta, cercanos                                 |
| Mi ruta                                     | `/mi-ruta`                                           | Paradas de una o varias regiones, orden editable, recorrido en el mapa, tramos aéreos separados (Rapa Nui)                                                                           |
| Suma tu negocio · Planes                    | `/suma-tu-negocio`, `/planes`                        | Beneficios, pasos, Presencia / Completo / Destacado + IVA, boleta o factura                                                                                                          |
| Municipios (informativa)                    | `/municipios`                                        | Qué ofrece [Comuna] en tu Mano y cómo conversar                                                                                                                                      |
| Fuentes y verificación                      | `/fuentes`                                           | Qué significa cada sello, fuentes oficiales, atribución OSM/ODbL                                                                                                                     |
| Nosotros · Contacto · Términos · Privacidad | `/nosotros`, `/contacto`, `/terminos`, `/privacidad` | Pie de página                                                                                                                                                                        |
| Panel privado                               | `/panel` (con inicio de sesión)                      | Municipio: su espacio comunal e identidad local. Negocio: su ficha, plan y documentos. Equipo: verificación y evidencias                                                             |

Notas:

- Regiones y provincias llevan prefijo porque varios nombres se repiten como comuna
  (Valparaíso, Coquimbo, Antofagasta, O'Higgins, Petorca…). Las comunas quedan en la raíz
  (`/la-ligua`), como se acordó para los espacios comunales.
- Provincias: usar la lista oficial vigente (División Político-Administrativa) con fuente
  y fecha; no armarla a mano.
- Panel privado y registro de negocios necesitan la base de datos Supabase y una petición
  expresa para activarse. Por ahora es solo diseño.

## Dirección visual

- **Firma del inicio:** franja vertical de Chile que se recorre bajando la página: de norte
  a sur cambia el color de zona (norte ocre, centro terracota, sur verde, austral turquesa).
  Respeta «reducir movimiento».
- Fondo marfil `#FAF6EE`, berenjena `#22162E` para cabecera y bandas, acento ocre
  `#F2AA19` y terracota `#A8401F`.
- Portadas regionales de la colección (`apps/mobile/assets/territorio/coleccion`)
  grandes, rotuladas «Ilustración». Nunca como foto de un negocio.
- Sellos: «✓ Verificado», «Fuente oficial», «Pendiente»; «Destacado» siempre rotulado
  como posicionamiento pagado.

## Prompts para GPT

Uso: adjunta en cada conversación el logo «Chile en la palma» (versión limpia de
`docs/diseno/marca/turismo-en-tu-mano/limpio/`) y, para región, la portada ilustrada
de esa región. Pide **una imagen por pantalla**. Trae las imágenes y se guardan en
`docs/web/disenos/` como ilustraciones de diseño.

### 0. Base (pegar primero)

> Eres director de arte de un sitio web de turismo nacional de Chile llamado «Turismo en tu Mano», plataforma de turismo y comercio local. Te adjunto el logo oficial: úsalo tal cual, completo, sin redibujarlo ni agregarle letras. Paleta: fondo marfil #FAF6EE, berenjena #22162E para cabecera y bandas, texto berenjena, acento ocre #F2AA19, terracota #A8401F, y colores de zona: norte ocre, centro terracota, sur verde, austral turquesa. Estilo: editorial, cálido, moderno, mucho aire, tipografía sans grande y limpia, esquinas redondeadas suaves, ilustraciones planas de paisajes chilenos con textura sutil. Nada de fotos de stock con personas posando, nada de texto en inglés. Todos los textos en español de Chile. Los nombres de negocios y lugares deben decir «Negocio de ejemplo» o «Lugar de ejemplo»; no inventes nombres reales. Todas las páginas comparten una barra superior berenjena: logo a la izquierda, al centro una píldora «📍 Estás en Región de Valparaíso ▾», un buscador, y a la derecha un botón ocre «Mi ruta (3)». Formato: maqueta de escritorio 1440×1024, vista frontal plana, sin marco de dispositivo, salvo que pida móvil.

### 1. Inicio

> Diseña la página de inicio. Portada a pantalla completa con el título grande «Chile, en la palma de tu mano», bajada «Turismo y comercio local de Arica a Magallanes», un buscador redondeado «¿A dónde vas? Comuna, región o lugar» y un botón secundario «Usar mi ubicación». A la derecha, una franja vertical ilustrada de Chile dividida en cuatro tramos de color (norte ocre, centro terracota, sur verde, austral turquesa) con la Región de Valparaíso marcada como «Tu región». Debajo: «Recorre Chile de norte a sur» con cuatro tarjetas grandes de zona; un bloque «En tu región hoy» con dos panoramas de ejemplo; carrusel «Negocios fundadores» con tres tarjetas «Negocio de ejemplo»; banda terracota clara «¿Tienes un negocio turístico? Aparece en tu comuna» con botón «Ver planes»; pie berenjena con Fuentes y verificación, Municipios, Términos, Privacidad.

### 2. Región

> Diseña la página de la Región de Valparaíso con la ilustración adjunta como portada ancha y una etiqueta pequeña «Ilustración» en una esquina. Migas con selectores: «Valparaíso ▾». Título «Región de Valparaíso». Fila de provincias como tarjetas («Provincia de ejemplo», número de comunas). Barra de pestañas: Qué hacer (activa), Explorar, Negocios. En Qué hacer: «Panoramas para hoy» y «Rutas de un día» con tarjetas que indican paradas, duración y «a pie» o «en auto», cada una con «+ Agregar a Mi ruta». Un recuadro aparte «Rapa Nui · traslado aéreo», separado del continente. Al pie, navegación grande entre regiones: «↑ Norte: Coquimbo» y «Sur: Metropolitana ↓», con una mini franja de Chile que marca la región actual.

### 3. Comuna con pestañas y Mi ruta

> Diseña la página de la comuna «La Ligua». Migas con selectores: «Valparaíso ▾ › Provincia de Petorca ▾ › La Ligua ▾». Pestañas Qué hacer, Explorar (activa), Negocios. Explorar ocupa casi todo el ancho: mapa claro y sobrio con marcadores redondos por categoría (playa turquesa, naturaleza verde, cultura terracota, gastronomía ocre) con ícono blanco; sobre el mapa, filtros tipo píldora y una tarjeta flotante de un lugar seleccionado con sello «✓ Verificado», botón «Cómo llegar» con selector «A pie / En auto» y «+ Mi ruta». A la derecha, panel lateral «Mi ruta» con tres paradas numeradas de distintas regiones (Metropolitana, Valparaíso, Coquimbo), botón «Ver recorrido» y la nota «Se guarda solo en tu navegador».

### 4. Ficha única (lugar o negocio)

> Diseña la ficha de un negocio. A la izquierda: imagen grande con un logo de negocio completo sobre fondo neutro (no foto de producto), título «Negocio de ejemplo», sello verde «✓ Verificado» y debajo en letra pequeña «Confirmado por el titular · revisado 16-11-2026». Descripción breve, horario, teléfono y redes como íconos. A la derecha: mini mapa, botón principal «Cómo llegar» con selector «A pie / En auto», botón secundario «+ Agregar a Mi ruta», y tarjeta «Cerca de aquí» con tres lugares de ejemplo y su distancia. Pie de ficha: «Fuente y verificación» y «¿Ves un error? Avísanos».

### 5. Mi ruta

> Diseña la página «Mi ruta». A la izquierda, lista de paradas numeradas que se pueden reordenar arrastrando, agrupadas por región con su color de zona (Metropolitana, Valparaíso, Coquimbo), con duración estimada de cada tramo y si es «a pie» o «en auto». A la derecha, mapa de Chile con el recorrido dibujado entre las paradas. Arriba: «Tu viaje · 3 regiones · 6 paradas» y botones «Iniciar ruta» y «Compartir». Un tramo marcado como «Traslado aéreo» con línea punteada para mostrar cómo se vería Rapa Nui. Nota pequeña: «Se guarda solo en tu navegador, sin coordenadas».

### 6. Suma tu negocio y planes

> Diseña la página «Suma tu negocio». Portada berenjena con título «Que te encuentren en tu comuna» y bajada «Turismo en tu Mano reúne turismo y comercio local de todo Chile». Tres pasos ilustrados: Elige tu plan, Envía tus datos y evidencia, Aparece verificado. Tres tarjetas de planes mensuales: Presencia $9.990 + IVA, Completo $24.990 + IVA (destacada con borde terracota y etiqueta «Recomendado»), Destacado $39.990 + IVA; cada una con tres a cinco beneficios con ticket. Nota: «Pago con tarjeta · boleta o factura». Bloque final «¿Representas a una agrupación o municipio?» con botón «Conversemos».

### 7. Panel privado

> Diseña el panel de administración de «Turismo en tu Mano» en estilo sobrio (fondo marfil, barra lateral berenjena). Menú lateral: Resumen, Mis fichas, Plan y pagos, Documentos tributarios, Espacio comunal, Verificación. Vista Resumen para una cuenta municipal de ejemplo: tarjetas con visitas del mes, fichas publicadas, fichas pendientes de revisión; tabla «Pendientes de verificación» con estado y fuente; vista previa de la portada comunal «[Comuna] en tu Mano» con identidad local de ejemplo.

### 8. Versión móvil (opcional, mismo chat)

> Ahora la misma página de [Inicio/Comuna/Ficha/Mi ruta] en versión móvil 390×844: la píldora «Estás en…» arriba, pestañas deslizables, tarjetas a una columna, botón «Mi ruta» flotante abajo y «Cómo llegar» fijo abajo en la ficha.

## Siguientes pasos propuestos

1. Generar las imágenes con estos prompts y traerlas.
2. Ajustarlas y guardarlas en `docs/web/disenos/` con nota de «ilustración».
3. Construir el sitio en `apps/web` por etapas: barra fija y Región → Comuna con pestañas →
   Ficha única → Mi ruta → Comercial. Panel privado solo cuando se active Supabase.
