Chile en Ruta — plan del producto (idea registrada, sin construir)
Estado: idea registrada el 24-10-2026. No hay nada construido. «Chile en Ruta» es un nombre de trabajo (otras opciones: «Turismo en tu Ruta», «Ruta en tu Mano»). Todo lo que sigue son propuestas para decidir.

1. Qué es y qué no es
Chile en Ruta es una app móvil abierta y nacional para viajar por Chile: arma rutas entre ciudades con paradas intermedias y muestra qué hacer, dónde comer y dónde dormir en el camino. Se puebla con la participación de los propios lugares turísticos, emprendedores y prestadores de todo el país, que se suman solos, más el aporte de los viajeros.

Es un producto totalmente independiente de Turismo en tu Mano.

Turismo en tu Mano	Chile en Ruta
Para quién	La municipalidad (cliente) y sus visitantes	El viajero y los oferentes de todo Chile
Qué es	«[Comuna] en tu Mano»: guía de una comuna + panel municipal	App móvil abierta con rutas por todo Chile
Quién pone los datos	La municipalidad	Los propios negocios, emprendedores y lugares, más la comunidad
Cómo se vende	Por municipio	Aparte (modelo en la sección 7)
Repo	Matichoc/city_tour (Papudo) y uno por comuna	Repo propio
Ninguno depende del otro. Más adelante podrían conectarse; por ejemplo, una comuna con Turismo en tu Mano podría publicar sus datos también en Chile en Ruta. Eso es opcional y no forma parte de este plan.

2. Qué resuelve (casos de uso)
Para el viajero

Viaje con paradas intermedias. «Voy de Santiago a La Serena: ¿dónde paro?». La app muestra lugares que valen la pena a lo largo del camino y cuánto cambia el viaje: tiempo en ruta + tiempo de la parada.
Cada viaje, su ruta. Origen y destino cualquiera (por ejemplo, Santiago → Talca con parada en Curicó), filtrando por intereses: patrimonio, comer, playa o naturaleza.
Mochileando día a día. Itinerario por días: cómo llegar, dónde comer, qué ver y dónde dormir.
Ahora, cerca de ti. «Son las 13:10, ¿dónde almuerzo cerca de mi ruta?», «¿dónde duermo esta noche?».
Guardar y compartir el viaje.
Para el oferente (lugar turístico, emprendedor, alojamiento, guía, artesano…) 6. Sumarse solo y gratis, en minutos y desde el celular: ficha, fotos, horarios, ubicación y contacto (WhatsApp, teléfono, web). 7. Aparecer en las rutas de los viajeros que pasan cerca. 8. Ver cuántas personas lo vieron o lo contactaron (estadísticas básicas).

3. Reglas de contenido (no cambian)
No inventar datos. Cada ficha muestra quién la puso y su estado:

Estado	Significa
Registrado por el negocio	Lo cargó el propio oferente
Verificado	Chile en Ruta confirmó identidad, ubicación y contacto
Sugerido por la comunidad	Un viajero lo propuso; sin confirmar
Desactualizado	Pasó cierto tiempo sin revisión
Fuente y fecha de la última actualización, siempre visibles.

Moderación antes de publicar las fotos y los textos nuevos, con protección contra abuso: límites por persona, comprobación anti-robots y pruebas firmadas en el servidor. El repo Matichoc/city_tour ya resolvió esto para los comentarios; ver docs/DISENO-ABUSE-01-02.md.

La ubicación del viajero se usa solo con su consentimiento y no se guardan coordenadas.

Revisión legal antes de lanzar: términos de uso, responsabilidad por lo que publican los oferentes, y la nueva ley de protección de datos personales.

4. Qué hay que construir
4.1 Alta y gestión de oferentes
Registro sin fricción: correo o teléfono con código, ficha guiada y fotos desde el celular.
Panel del oferente para editar su ficha, ver estadísticas y renovar datos, con un aviso cuando la ficha queda desactualizada.
Verificación escalonada: contacto confirmado, luego ubicación y luego, si se quiere, documento o visita.
4.2 Moderación y administración
Cola de revisión de altas, fotos y sugerencias de la comunidad.
Reportes de viajeros («cerrado», «dato incorrecto»).
Registro de cambios (quién y cuándo).
4.3 Búsqueda a lo largo de una ruta
Lugares dentro de un corredor de N km alrededor del trayecto, ordenados por el desvío (minutos extra) y por los intereses del viajero.

4.4 Ruteo entre ciudades
Servidor de ruteo propio (OSRM o Valhalla) con el extracto de Chile de OpenStreetMap: tramos en auto y a pie, desvío de cada parada y tiempos estimados. Los servicios públicos gratuitos son de uso justo y no sirven para una app nacional.

4.5 Mapas y uso sin señal
Mapas de Chile en PMTiles autoalojados, sin cobro por vista, y descarga por región para usar la app sin señal en carretera.

4.6 App móvil y web
Recomendado: monorepo con
apps/mobile: React Native con Expo, la app del viajero y del oferente;
apps/web: Next.js, con la página pública, el panel del oferente (que también funciona en el navegador) y la administración;
packages/core: tipos, motor de itinerario y geometría compartidos.
Base de datos: Supabase (Postgres + PostGIS para la búsqueda en el corredor), con RLS estricta.
Cuentas opcionales para el viajero, solo para guardar y sincronizar viajes.
4.7 Fuera del primer alcance
Horarios de buses interurbanos: no se conoce una fuente abierta nacional confiable. Evaluar GTFS donde exista.
Reservas y pagos dentro de la app.
5. Cómo se puebla (crecimiento)
Oferentes que se suman solos: es la fuente principal, con difusión abierta en redes, gremios, cámaras de comercio y ferias.
Aportes de los viajeros: sugerir un lugar o avisar que algo cambió.
Datos abiertos (OpenStreetMap) para servicios básicos del camino, rotulados «sin verificar».
Registros públicos de turismo (por ejemplo, el registro de prestadores de SERNATUR): evaluar sus condiciones de uso antes de incorporarlos.
Semilla por corredores: partir con una ruta (por ejemplo, Santiago → La Serena) y poblarla bien antes de abrir otra.
6. Reutilizable desde Matichoc/city_tour (como referencia)
Es un repo público con piezas probadas que conviene copiar o adaptar, no importar:

Pieza	Ruta en city_tour
Ruteo a pie y en auto con interfaz intercambiable (RouteProvider)	src/lib/routing/
Recorrido en vivo: ajuste a la ruta, desvío y recálculo	src/lib/live-nav.ts, src/components/trip/
Motor de itinerario	src/lib/itinerary-engine/
Protección contra abuso en contenido de visitantes	docs/DISENO-ABUSE-01-02.md, supabase/migrations/0027_*–0029_*
Modelo de datos con verificación y fuentes	docs/DATA-MODEL.md
Idiomas es/en/pt	src/messages/
7. Modelo de negocio (opciones a decidir)
Opción	Cómo funciona	Ojo con
A. Freemium para oferentes	Ficha gratis; pago por destacarse, estadísticas avanzadas o más fotos	Que lo pagado siempre se rotule como «destacado»
B. Premium para viajeros	Gratis lo básico; pago por descargas sin conexión, viajes ilimitados o modo mochilero	Competencia con apps de mapas gratuitas
C. Alianzas rotuladas	Rutas temáticas con patrocinio (regiones, gremios, marcas), siempre marcadas	No mezclar publicidad con recomendación
8. Fases propuestas
Fase	Qué
0	Decisiones (sección 9), marca (revisar disponibilidad en INAPI), dominio y esqueleto del repo con reglas, CI y validación
1	Alta de oferentes + moderación + catálogo con mapa y búsqueda por región
2	Ruteo entre ciudades y paradas sugeridas en un corredor (Santiago → La Serena)
3	App móvil para el viajero: buscar ruta, paradas, guardar y compartir el viaje
4	Descarga por región para usar sin señal + modo mochilero día a día + «ahora cerca de ti»
5	Más corredores y regiones; estadísticas para oferentes; modelo de negocio activo
9. Decisiones pendientes
Nombre definitivo («Chile en Ruta», «Turismo en tu Ruta» u otro).
Estructura: monorepo con app + web + paquete común (recomendado) o repos separados.
App: Expo (recomendado) o PWA.
Modelo de negocio: A, B, C o una mezcla.
Primer corredor (propuesta: Santiago → La Serena).
Nivel de verificación mínimo para que una ficha aparezca en las rutas.

10. Reformulación de la visión — conversación del 24-10-2026

Esta sección conserva la idea original y registra su evolución. En los puntos que cambian, esta reformulación reemplaza las propuestas anteriores. No autoriza todavía construir el esqueleto ni funciones. Las fases originales deben revisarse antes de implementarlas.

10.1 Propósito y público
Una plataforma pública de descubrimiento de turismo, pequeñas y medianas empresas, emprendimientos y comercio local de todo Chile, con vocación de difusión y crecimiento viral. Las rutas conectan lo descubierto; no son el único punto de entrada al producto. No está decidido que sea una red social ni que tenga comentarios, seguidores o publicaciones personales.

Incluye atractivos turísticos, gastronomía, hotelería tradicional, residenciales, ofertas, comercio establecido local, emprendimientos por encargo e itinerantes. No se propone un catálogo de departamentos ni un servicio de arriendos particulares al estilo Airbnb.

10.2 Inicio: recorrer Chile por regiones
La primera pantalla presenta en general la región donde está la persona y prioriza descubrimientos cercanos, ampliándose hacia el resto de la región. La ubicación del dispositivo se solicita con consentimiento; no se propone guardar sus coordenadas. Sigue pendiente definir la experiencia cuando la persona no concede el permiso.

La navegación principal se imagina como un recorrido vertical por Chile: desplazarse hacia el norte permite descubrir regiones del norte; hacia el sur, las del sur. Cada sección representa una región y sus atractivos, comercios y emprendimientos. El gesto exacto y su relación con el movimiento del contenido se deben probar en la maqueta para evitar confusiones.

La región que se está explorando puede diferir de la ubicación física del usuario. Es posible recorrer otras regiones para preparar vacaciones y descubrir qué hay entre el origen y el destino.

10.3 Secciones y viaje
Inicio: descubrimiento regional con identidad visual propia, diferente de los otros proyectos.
Exploración: contenido de la región que se está consultando; cambia al cambiar de región.
Eventos: eventos de la región consultada, tanto la actual como una futura región de destino.
Mi ruta (nombre provisional): reúne lugares y paradas elegidos mientras se recorren las regiones, para un viaje previsto o aún sin fecha.

La propuesta incluye visualizar y simular el recorrido en un mapa: origen, destino, paradas, desvíos y tiempos estimados. Contempla ida y vuelta y la elección de regresar o no al punto de partida. Los lugares seleccionados deben distinguirse de los negocios que no constituyen una parada visitable.

10.4 Visibilidad y modelo comercial por definir
Se busca que todos los inscritos tengan oportunidades de aparecer, evitando que solo sean visibles los más populares. Se conversaron como posibilidades la rotación, el azar, las recomendaciones, las notas y la interacción. También se propusieron planes que modifiquen frecuencia, duración, tamaño o espacio de exposición.

La intención expresada es que todos aparezcan diariamente. Aún no es una garantía técnica: falta definir qué cuenta como aparición (inclusión en la rotación o visualización real por una persona), capacidad disponible, volumen de inscritos, distribución justa y relación con los planes. No se fijaron duraciones, precios ni un algoritmo. Toda exposición pagada deberá identificarse como tal, conforme a la regla original de publicidad rotulada.

10.5 Emprendimientos y presencia física
Los emprendimientos por encargo, a domicilio o itinerantes pueden formar parte del catálogo aunque no siempre correspondan a una parada en ruta. Se propuso exigir verificación en Google para aparecer como comercio local o parada; queda pendiente precisar el alcance y cómo comprobarla. No se asume que tener una ficha en Google equivalga a verificación propia por la plataforma ni que autorice publicar una dirección privada.

10.6 Prioridad inmediata y decisiones aplazadas
El nombre continúa provisional. Se aplazan la revisión de INAPI, marca y dominio: la prioridad es desarrollar y evaluar una maqueta de aplicación móvil y comprobar su funcionamiento en Android mediante APK. No se necesita contratar un dominio para esta validación inicial. La maqueta utilizará solo datos de ejemplo rotulados como tales, sin inventar información turística real.

Antes de construir, acordar la experiencia de la maqueta y presentar su esqueleto para aprobación. No se han elegido aún todos los detalles técnicos ni se ha autorizado implementar las funciones de las fases posteriores. Los repositorios de los otros proyectos permanecen independientes; no se modifican sin las dos confirmaciones por trabajo exigidas por el usuario.

10.7 Dirección visual del inicio — tarjetas regionales
El usuario confirma un inicio centrado en tarjetas y una composición que represente visualmente la región consultada. El mapa no será protagonista del inicio: se reserva para la exploración y para pequeños contextos de ubicación dentro de las fichas de atractivos. No es necesario incluir un mapa regional en la portada de la maqueta.

Cada región tendrá identidad visual mediante imágenes o ilustraciones simuladas, simples y livianas durante la maqueta. La referencia visual puede alternar entre distintos lugares de la región, con rotación a lo largo del mes. La implementación, frecuencia y transiciones se definirán al diseñar la maqueta; no se exige descargar imágenes pesadas ni generar contenido continuamente.

Para Valparaíso, el usuario propone como referencias posibles un moái de Rapa Nui, el puerto de Valparaíso, el reloj de flores de Viña del Mar, los túneles del sector de Petorca y la playa de Papudo. Son referencias para la dirección artística, no fichas turísticas verificadas ni afirmaciones de accesibilidad por carretera. Debe revisarse la referencia exacta antes de convertirla en contenido real; Rapa Nui no constituye una parada vial desde Chile continental. Las ilustraciones de maqueta se identificarán como ilustraciones de referencia.

La organización visual permitirá descubrir la región, sus provincias y sus comunas de manera gradual y armoniosa, con contenido agrupado por territorio. La portada representa la región completa aunque muestre un motivo de una comuna o provincia concreta; debe identificar el lugar representado sin confundirlo con el alcance de toda la región. Cambiar el motivo de fondo no cambia por sí solo la región consultada ni los filtros territoriales.

Propuesta para presentar y validar antes de construir: encabezado con región consultada y acción para cambiarla; portada regional ilustrada con identificación del motivo; accesos a exploración y eventos; grupos de tarjetas por provincia y acceso a sus comunas; navegación del viaje. La composición exacta, el espacio de las ofertas y la relación entre desplazamiento por contenido y cambio de región siguen pendientes de validar.

10.8 Navegación entre regiones — definición del usuario
La navegación regional principal será mediante gestos verticales: hacia arriba para ir al norte y hacia abajo para ir al sur. Esta definición reemplaza la propuesta conversada de utilizar el desplazamiento vertical solo para contenido y botones como mecanismo principal de cambio de región. La interfaz debe enseñar claramente la dirección de ambos gestos.

Habrá además un selector desplegable con todas las regiones para ir rápidamente a una región concreta. Al seleccionarla, la transición recorrerá visualmente las portadas de las regiones intermedias, en el orden geográfico correspondiente, hasta llegar al destino. El objetivo es sentir el recorrido por Chile, no abrir una pantalla desconectada de la anterior. La animación no debe activar consultas, permisos de ubicación ni cambios persistentes por cada región intermedia; estas solo se representan durante el tránsito.

El usuario describe ventanas de 0,1 o 0,2 «milisegundos». Se interpreta provisionalmente la intención visual como 0,1–0,2 segundos (100–200 ms) por región, ya que fracciones de milisegundo no permiten distinguir una pantalla. La duración exacta y un límite total para trayectos largos deben ajustarse en la maqueta. No es una medida definitiva aprobada. Se respetará la preferencia del dispositivo de reducir movimiento, ofreciendo en ese caso una transición breve sin recorrer animadamente todas las portadas.

En el extremo norte solo se ofrece avanzar hacia el sur; en el extremo sur, hacia el norte. No habrá navegación circular ni regiones inexistentes más allá de los límites. Arica y Punta Arenas fueron los ejemplos del usuario para representar estos extremos; la navegación se organiza por regiones, no por ciudades, y sus límites corresponden a Arica y Parinacota y Magallanes y de la Antártica Chilena.

Queda por diseñar cómo explorar contenido dentro de cada región sin confundir ese gesto con el cambio regional: tarjetas resumidas que abran una vista de detalle o exploración constituyen una posibilidad por presentar, no una decisión cerrada. No implementar todavía estas interacciones; primero presentar la maqueta y el esqueleto para aprobación.

11. Planificación técnica y visual — entrega de Fase 0

El usuario pide propuestas visuales almacenadas, opciones de nombre y una arquitectura técnica que contemple crecimiento. El logo sigue aplazado y no se elige un nombre automáticamente. La prioridad aclarada es definir pantallas y navegación para comenzar después con primeras APK descargables. No se autoriza todavía implementar funciones productivas de Fase 1.

Documentos de propuesta: [arquitectura y plan técnico](PLAN-TECNICO.md), [nombres candidatos](NOMBRES.md), [direcciones visuales](diseno/PROPUESTAS.md) y [pantallas y entregas APK](diseno/PANTALLAS.md). La lámina visual se conserva en docs/diseno/propuestas-visuales-v01.png. Son propuestas para revisar, no decisiones técnicas aprobadas ni una aplicación ejecutable. Primero revisar dirección visual y pantallas; luego aprobar el esqueleto antes de construirlo. La maqueta Android usa ejemplos locales y no requiere resolver dominio, marca ni backend productivo.

12. Territorio Vivo — nombre elegido y dirección visual

El usuario elige Territorio Vivo como nombre para continuar, por cómo suena y sin incluir Chile directamente en la marca. Se mantiene el alcance chileno del producto. La revisión de marca, dominio y disponibilidad continúa aplazada y no se crea logo todavía. Esta decisión reemplaza el nombre pendiente de las secciones anteriores sin reescribir el plan original.

La dirección visual combina ambas propuestas: preferencia por el tema oscuro y la portada inmersiva de B; exploración de provincias/comunas y selector con mapa de A; tarjetas de detalle de emprendimientos y eventos de B. Habrá temas claro y oscuro sobre la misma estructura, sin separar funciones o navegación por tema. La preferencia por oscuro no implica imponerlo a todas las personas. Falta acordar el comportamiento inicial del tema y revisar las pantallas concretas. No constituye aprobación del esqueleto ni autorización para construir funciones posteriores.

13. Base aprobada para avanzar a la primera APK

El usuario confirma las pantallas V02 como base visual. El selector será un menú lateral con mapa interactivo y lista de regiones; se contempla agrupar visualmente norte, centro, sur y extremo sur, con límites editoriales aún por definir, y señalar destacados seleccionables del viaje según territorio. Seleccionar un evento abre su información y permite guardarlo, sin prometer conectividad ni tiempos de ruta calculados.

El inicio usa ubicación consentida para abrir la región y priorizar la zona cercana. Ejemplo expresado: La Ligua, provincia de Petorca, región de Valparaíso; eventos y contenido locales primero, con expansión al resto de la región. Diferenciar la posición física de la región que el usuario elige explorar. No guardar coordenadas ni presentar contenido lejano como cercano.

Se solicita iniciar preparación de un catálogo basal nacional a partir de directorios públicos. La procedencia, licencia, vigencia y condición de no verificado se revisan antes de incorporar registros. El inventario y bloqueo actual están en FUENTES-DATOS.md; no se importaron datos aún. La posible referencia a los otros repositorios no sustituye las dos confirmaciones por trabajo exigidas para consultarlos o modificarlos.

Se presenta ESQUELETO-APK.md como propuesta concreta de monorepo Expo/React Native, web Next.js y paquetes comunes, con Supabase previsto para el futuro. La dirección de producto está aprobada; la tecnología y la creación de archivos de aplicación se confirman antes de construir, conforme a la instrucción inicial del usuario. Mantener la bitácora y distinguir APK generada, instalada y probada.
