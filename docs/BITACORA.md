# Bitácora

## 24-10-2026 — Plan original

- Plan del producto guardado íntegro en docs/PLAN.md.
- Commit original local: `4d74eeb`; versión con correo noreply: `ae986d6`, rama `docs/plan-inicial`.
- PR: no creado; sin push.

## 24-10-2026 — Visión regional, propuestas visuales y plan técnico

- Registrada la evolución hacia descubrimiento nacional de pymes y turismo, portadas regionales y navegación norte/sur con selector y tránsito visual.
- Preparadas dos direcciones visuales: Territorio vivo y Ventanas de Chile. Lámina generada con herramienta de imágenes y conservada en [propuestas-visuales-v01.png](diseno/propuestas-visuales-v01.png). Son imágenes de concepto, no pantallas implementadas, cartografía oficial ni contenido turístico verificado.
- Guardadas propuestas de nombres, arquitectura, seguridad, escalado, mapa de pantallas y procedimiento para futuras APK internas de Android.
- Prioridad del usuario: revisar pantallas antes de construir y luego entregar APK para instalar. No se eligió nombre ni se creó logo.
- Sin esqueleto, dependencias, cuentas, servicios ni funciones de fases posteriores. No se consultaron ni modificaron los otros repositorios durante esta entrega.
- Validación documental: diferencias sin errores de espacios, enlaces relativos, imagen PNG exportada y revisión de coherencia. No hay aplicación ni comandos de typecheck/lint/tests/build todavía; no se presentan como ejecutados. Sin push.
- PR: no creado; esta propuesta queda para revisión antes de aprobar la construcción.

## 24-10-2026 — Territorio Vivo y mezcla visual V02

- El usuario elige **Territorio Vivo** como nombre para seguir; marca y logo siguen aplazados.
- Dirección elegida: portada oscura de B, exploración territorial y selector con mapa de A, tarjetas de detalle y eventos de B. Claro y oscuro comparten la misma estructura.
- Generada y guardada la [lámina V02](diseno/territorio-vivo-v02.png), con portada, exploración y selector en ambos temas. Es una propuesta refinada pendiente de revisión, no una APK ni una aprobación del esqueleto. Imágenes, mapa y descripciones son ilustrativos; no verifican datos turísticos ni sustituyen cartografía.
- Actualizados plan, nombres, dirección visual, pantallas y arquitectura. Propuesta de selector de tema Sistema/Claro/Oscuro todavía por confirmar.
- Validación: enlaces documentales locales, firma PNG y diferencias sin errores de espacios. Sin aplicación ni pruebas de ejecución; sin push.
- PR: no creado.

## 24-10-2026 — Mockups base aprobados y preparación de APK

- El usuario aprueba V02 como base visual para avanzar a una APK: menú lateral con mapa y lista interactivos, regiones y destacados, inicio localizado con prioridad de comuna/provincia dentro de la región.
- Ejemplo de comportamiento: estando en La Ligua, abrir Valparaíso y priorizar Petorca; ubicación con consentimiento y sin conservar coordenadas. La región explorada no se reemplaza automáticamente por la posición física.
- Guardado [esqueleto concreto para confirmar](ESQUELETO-APK.md), con tecnología propuesta y alcance de la maqueta. No se crearon todavía archivos de aplicación ni se considera aprobada una tecnología solo por haber aprobado imágenes.
- Preparado [inventario de fuentes públicas](FUENTES-DATOS.md). Consultas a SERNATUR, datos.gob.cl, OpenStreetMap y Chile Cultura devolvieron 403 del túnel del proxy; no se leyeron licencias ni descargaron registros turísticos.
- Comprobado Node 24.19.0 y Java 21; no se localizaron herramientas Android SDK/adb ni EAS CLI. Consultada disponibilidad de Expo en npm; aún sin matriz validada ni build Android. Corregida caché npm para usar una ubicación escribible fuera del checkout.
- Guardados en borrador de configuración los dominios de fuentes públicas y documentación Expo, preservando dominios existentes. El guardado no aplica la red en ejecución. También se retiró el antiguo script de instalación que solo actuaba sobre los otros repositorios, y se sustituyó la instrucción de arranque por el alcance exclusivo de conexion_emprende y las dos confirmaciones exigidas para cada trabajo externo. No se ejecutó instalación ni arranque en otros repositorios.
- Sin push ni PR. Validación documental y de enlaces locales; no existe aún aplicación para ejecutar typecheck/lint/tests/build. La APK no está generada ni probada.

## 24-10-2026 — Cascarón Android/iOS y compilación APK en GitHub

- El usuario indica compilar exclusivamente la APK en GitHub Actions, contemplar iOS nativo desde el inicio y preparar presupuesto/monetización. Se avanza con el esqueleto en feat/base-android-ci, basado en develop y conservando el historial documental.
- Monorepo pnpm, Expo 58.0.19, React Native 0.88.0 y Expo Router 58.0.26; web mínima Next.js 16.4.3; paquetes core, mensajes y tokens. Escritas las reglas en AGENTS.md y CLAUDE.md.
- Cascarón funcional: portada con ilustración esquemática original, temas Sistema/Claro/Oscuro, selector lateral mapa/lista de 16 regiones, tránsito visual, controles y gesto norte/sur, pestañas con estados honestos sin catálogo. [Captura real del cascarón](diseno/cascaron-v0.1.0.png), distinta de los mockups de dirección artística.
- Sin ubicación automática, datos reales, guardado de paradas ni ruteo operativo. Sin backend remoto, cuentas, cobros o servicios productivos. Los otros dos repositorios no se consultaron ni modificaron.
- Workflow único: validación completa y después Expo prebuild + Gradle en Ubuntu GitHub, ARM64, bundle incluido y firma pública de desarrollo. Verifica distribución Gradle, firma APK y bundle; artefactos con commit y checksum, retención 14 días. Acciones fijadas por SHA tras consultar sus repositorios oficiales. No usa EAS ni credenciales Expo; no se compiló APK local ni se instaló Android SDK aquí.
- Probada generación de proyecto Android desde Expo (prebuild sin instalación/compilación), comprobando su configuración de firma de pruebas. Directorios nativos generados ignorados, sin claves en Git. iOS declara configuración y exporta JS; build nativo y firma Apple todavía no probados.
- Validación completa en verde: typecheck, ESLint, cinco pruebas, exportación Metro Android/iOS/web, build Next.js y formato. Instalación repetida con lockfile congelado en verde. actionlint 1.7.11 sin hallazgos; binario obtenido de releases oficiales y checksum comprobado.
- Smoke en Chromium móvil: portada, selector, extremos norte/sur, cambio hacia región vecina, pestañas Eventos/Mi viaje, temas y reducir movimiento. Sin errores JavaScript en el recorrido observado. Esto no sustituye instalación en Android.
- Comprobación adicional Expo online bloqueada por proxy; comprobación offline informa dependencias actualizadas con advertencia de confiabilidad limitada. No se presenta como compatibilidad nativa demostrada; esta queda pendiente del build en GitHub.
- Guardado [presupuesto y plan freemium](COSTOS-Y-MONETIZACION.md): escenarios con supuestos explícitos, moderación/soporte, precios hipotéticos, equilibrio y reglas de exposición pagada. Nada contratado ni precio aprobado.
- Guardado api.github.com como requisito de red del entorno, preservando destinos anteriores. La API devolvió 403 de túnel; no se concluye falta de cuenta ni se solicitaron tokens. El acceso Git se comprueba por separado. Resultado de publicación del código y PR se añadirá a continuación.

### Corrección de privacidad antes de publicar

GitHub rechazó la primera subida con GH007 por el correo privado de los commits nuevos. Se conservaron los contenidos y mensajes, cambiando solo la identidad de correo a noreply en los commits aún no publicados. No se modificó la configuración de privacidad de la cuenta ni se forzó una rama remota. El historial anterior se conserva en una referencia local de respaldo que no se sube. Correspondencias para este registro: 4d74eeb → ae986d6; 990f004 → 53f1977; a6743ca → 75cb956; 9aaef1a → ac7c68a; 31dc4a4 → 80111ce. La subida se reintenta después de la validación completa.

### Publicación del código y resultado remoto

- Rama feat/base-android-ci subida correctamente después de la corrección noreply. Commit remoto de referencia: 53043db. PR [#1](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/1), borrador, base develop. Main no se modificó. El PR quedó adjunto a esta tarea.
- La API GitHub volvió a responder; se pudo crear el PR y consultar checks. La validación pasó en GitHub en la [ejecución del PR](https://github.com/cristobalrocosaavedra/conexion_emprende/actions/runs/40115468997). El job compilar falló en 43 segundos con código 1. La anotación no contiene causa adicional; no se modificó código a ciegas ni se reintentó el mismo build sin diagnóstico.
- Se pidió cancelar la ejecución duplicada por push para reducir consumo. La ejecución principal del PR es la referencia del diagnóstico.
- Bloqueo externo: los logs se sirven desde results-receiver.actions.githubusercontent.com y productionresultssa19.blob.core.windows.net, y su descarga devuelve 403 del proxy. Se guardaron ambos dominios en el borrador de red, preservando los existentes. Requiere aplicar los ajustes del entorno para continuar. No hay APK disponible ni instalación Android comprobada; no se afirma que la compilación nativa funcione.
- Reintento de fuentes tras el cambio de acceso: datos.gob.cl respondió 200; se guardó únicamente inventario de cinco conjuntos, todos con licencia declarada no comercial y metadatos de 2015. No se importaron registros turísticos. La URL candidata SERNATUR respondió 404 y debe reemplazarse por una vigente. Documentación Expo respondió 200 en ese reintento.
- Las notas de cierre y el inventario se conservan en un commit local, sin otra subida mientras la compilación nativa siga sin diagnóstico. Retomar con acceso a logs, corregir la causa, validar todo antes de push y comprobar el artefacto real. Los importes freemium/presupuesto siguen siendo propuestas, no tarifas verificadas ni precios aprobados.

## 24-10-2026 — Continuación tras fusionar el PR #1

- Se comprobó que el usuario fusionó el PR #1 en develop; main no se modifica. Rama de corrección fix/compilacion-apk creada desde origin/develop, preservando las notas y el inventario que habían quedado locales.
- La política observada del entorno ya permite los destinos de logs. Se descargó el log del job fallido y se identificó el fallo anterior a Gradle: curl no seguía la redirección del checksum oficial. Reproducción: sin redirección HTTP 301 y 167 bytes; siguiendo HTTPS, HTTP 200 y exactamente 64 caracteres hexadecimales.
- Corregida descarga con seguimiento de redirecciones solo HTTPS. Se conserva la validación de SHA-256 y se rechaza discrepancia con un checksum previamente guardado. No se deshabilita ninguna verificación.
- Unificada concurrencia por rama para que el push y el PR del mismo cambio no compilen dos APK simultáneamente.
- Validación completa antes de push; build nativo seguirá exclusivamente en GitHub. Resultado de PR y ejecución remota se registrará al comprobarlos.

### PR de corrección y comprobaciones

- PR [#2](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/2), borrador a develop, commit 2d69dc6. Ejecución de referencia [40117286924](https://github.com/cristobalrocosaavedra/conexion_emprende/actions/runs/40117286924).
- La validación completa local terminó en verde antes del push; se probó el fragmento real del workflow con descarga oficial, repetición idempotente y rechazo de discrepancia. La validación del PR también pasó en GitHub.
- El grupo de concurrencia compartido canceló el build duplicado del push al comenzar el del PR. Main y los otros repositorios siguen sin modificaciones.

### Primera APK generada en GitHub

- Ejecución 40117286924 terminada en success. Validar: 1m10s; compilar: 14m26s. La verificación de Gradle, build release, firma, presencia del bundle y subida del artefacto terminaron en success.
- [Descarga del artefacto territorio-vivo-android-5](https://github.com/cristobalrocosaavedra/conexion_emprende/actions/runs/40117286924/artifacts/12569897462), ID 12569897462, 33.706.587 bytes de archivo distribuido, sin expirar al comprobarlo. Contiene APK ARM64 0.1.0, commit, checksum y LEEME. El tamaño corresponde al artefacto, no se presenta como tamaño exacto del APK extraído.
- Código de referencia: 2d69dc682a2421a32afec0f566f1661157f82fd0. PR #2 permanece como borrador a develop. Las ejecuciones duplicadas canceladas son distintas de los jobs aprobados de la ejecución de referencia.
- Logs completos descargados por el destino results-receiver y resultado de firma/bundle confirmado en CI. La descarga binaria adicional desde este entorno fue bloqueada en productionresultssa6.blob.core.windows.net; ese host específico se guardó en el borrador de red, pendiente de aplicar. No se afirma comparación local del checksum del APK.
- No se compiló APK en esta máquina, no se instaló en Android real/emulador y no se probó build nativo iOS. Siguiente paso del usuario: descargar, instalar y revisar portada, selector, gestos, pestañas y temas. La ubicación y el catálogo siguen pendientes.
- Notas de cierre conservadas en un commit local para no disparar otra compilación nativa idéntica por una actualización documental; el resultado también queda en la descripción del PR #2.

## 24-10-2026 — Maqueta territorial ampliada, versión 0.2

- El usuario solicita una experiencia más completa tras probar Android. Confirmada dos veces la lectura y copia/adaptación de elementos de city_tour y directorio_turistico, con prohibición de modificarlos. Solo se trabaja en conexion_emprende.
- Snapshot del directorio: 37 referencias, 63 localidades y 3 recorridos. Fuente y estado pendiente por ficha. Las Palmas se clasifica en Coquimbo según la nota del origen; Castillo del Diablo permanece como referencia sin pin ni coordenadas confirmadas.
- Copiadas ilustraciones genéricas y portadas de rutas del titular y adaptada su función Haversine, sin dependencias entre proyectos. Procedencia y alcance en content/sources/REUTILIZACION.md.
- Generados cuatro fondos de zonas; recursos WebP optimizados de unos 640 KB en total. Las 16 regiones usan contextos y geometrías propias de Natural Earth (dominio público), con atribución y precisión referencial.
- Portada de ventana completa con gesto norte/sur capturado fuera de la ilustración, tarjetas horizontales y salto regional con tránsito visual. Mapas Leaflet en WebView nativa y vista web; filtros, fichas, paradas, recorridos, ida/vuelta y persistencia de preferencias/IDs sin coordenadas del usuario. Agenda de ejemplo rotulada.
- Ubicación solo en primer plano con consentimiento; si no hay permiso o resolución fiable se conserva selección manual. La app no solicita ubicación en segundo plano.
- Añadidas pruebas de catálogo/procedencia, gestos, seguridad del puente HTML, persistencia y recorridos; pruebas de interfaz con Chromium, incluido gesto fuera de la imagen y mapa sin teselas. Resultado de validación y APK se registra después de ejecutar.

### Actualizaciones y revisión previa de pantallas

- Por indicación del usuario, cada entrega mostrará dos o tres vistas principales antes de ofrecer descargar. La candidata genera automáticamente inicio, explorar y ficha, y las adjunta también al artefacto.
- Conservados identificador y certificado de la APK base. CI asigna número creciente y compara firma, paquete y versión con la APK previa; la instalación real encima se comprobará en el teléfono. Las preferencias y paradas válidas se conservan, sin coordenadas del viajero.
- Preparado canal GitHub Releases: únicamente una fusión revisada por el usuario a develop y un build verde publicarán la nueva última versión compartida. Los PR solo producen candidatos. El enlace estable todavía no está publicado. No se fusiona main ni se publica en tiendas.
- Inicio con jerarquía región → provincia → comuna y prioridad de contenidos de la comuna. La selección manual se distingue de la ubicación identificada por el sistema y se conserva entre aperturas.
- Documentado el procedimiento en ACTUALIZACIONES.md. La actualización descarga el APK completo; no son parches ni actualizaciones automáticas remotas.

- Validación local de la candidata: typecheck, lint, 22 pruebas de lógica y protección del canal de publicación, exportaciones Metro Android/iOS/web, build Next.js, ocho flujos de interfaz móvil y formato en verde. Incluye persistencia de comuna y restauración de preferencias anteriores.
- Tres [capturas funcionales](diseno/0.2/README.md) guardadas para revisión previa. La captura usa La Ligua manual y tema oscuro; la conexión del entorno no carga las teselas, por lo que el mapa presenta honestamente límites, puntos y aviso. Los otros dos repositorios siguen sin modificaciones.

- Candidata publicada en rama feat/maqueta-territorial, commit 8617bf7. PR [#3](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/3), borrador hacia develop, sin fusión. Incluye la corrección del PR #2; la compilación nativa y comparación con la APK base se están comprobando en GitHub Actions. El canal compartido sigue sin publicar hasta la revisión/fusión del usuario.

- Revisión adicional en 360 × 640: detectado recorte de tarjetas y controles inferiores al mostrar provincia/comuna. Ajustada la portada en alturas reducidas (cabecera condensada, imagen de tarjeta menor y acciones horizontales) y añadida comprobación de visibilidad. La ejecución previa se cancela para validar/compilar la candidata corregida.

### Portada de Matichoc corregida por el titular

- El usuario solicita logo o puesto/toldo de feria como imagen principal. Se retira la tableta y se utiliza el mismo diseño de logo disponible en el directorio autorizado, sin alterar el original ni modificar ese repositorio. Logo completo con ajuste contener y fondo blanco en tarjetas y ficha. Se registra la preferencia en AGENTS.md y CLAUDE.md.
- Se regeneran las tres vistas y se sustituye la candidata del PR #3 después de la validación completa; cancelado el build previo para no entregar la portada descartada.

### Contenido vivo y bloqueo de consulta remota

- Aclarada la separación entre binario y contenido: fichas, medios, eventos y portadas programadas se servirán desde backend/almacenamiento con revisión, RLS y caché, sin APK por cada cambio. Registrado el flujo y el ejemplo de eventos de enero cargados en octubre en PLAN-TECNICO.md y en la descripción del PR #3. Sin activar servicios remotos ni cuentas.
- Último código subido: 7f32b14, con el logo de Matichoc. Validación local completa en verde (22 pruebas de lógica y 9 de interfaz, typecheck, lint, build Android/iOS/web, Next.js y formato). La validación remota terminó correctamente en la ejecución 40125333713; la APK estaba en compilación nativa al perder acceso.
- Después, GitHub devolvió HTTP 401: gh auth status confirmó credencial inyectada no válida y git ls-remote tampoco pudo autenticarse. No se reemplazaron credenciales ni se solicitó un token. No se afirma APK generada, firma comparada ni instalación verificada para esta candidata: resultado final remoto sin confirmar.
- Los tres previews remotos existen como pantallas-13, artefacto 12572696476; la descarga desde este entorno fue bloqueada en productionresultssa11.blob.core.windows.net. Destino añadido al borrador de red preservando los anteriores. El guardado confirmó requires_publish; aplicar requiere revisar/guardar y publicar en ajustes. Las capturas locales están en docs/diseno/0.2.
- Esta aclaración documental queda en commit local, pendiente de push cuando se restablezca el acceso de GitHub. El código funcional y sus capturas ya están en el PR #3; no hay publicación del canal compartido ni fusión a main.

### Acceso restablecido y corrección del lector de certificados

- Al retomar, GitHub vuelve a responder con la autenticación gestionada, sin cambiar ni solicitar credenciales. Se confirma que la ejecución 40125333713 completó la compilación Gradle y falló en el verificador posterior: el certificado leído era undefined, no un hash diferente. No se publicó el artefacto ni el canal compartido.
- El lector esperaba únicamente el texto Signer #1. Consultado el código de ApkSignerTool.java (venshine/apksig, revisión c0314349dc9f9ccaf9300a39b592af478dc497e9): con esquema v3.1 identifica firmantes por intervalos SDK. Se admite ese formato conservando identidad única, digest SHA-256 válido y comparación con el certificado fijado; no se permite rotar a otra clave. Se aplica al APK nuevo y a la base histórica.
- Añadidas siete pruebas del lector: numerado, intervalos SDK, normalización, rechazo de certificados distintos, hash incompleto, segundo firmante ilegible y sello/clave pública ajenos. El workflow mostrará solo los fingerprints públicos del certificado para diagnosticar el formato. Sin cambiar identificador ni certificado esperado, y sin generar claves nuevas.
- Se subirá también la aclaración local de contenido vivo al mismo PR #3 tras la validación completa. La actualización real sigue pendiente de comparación nativa y prueba en el teléfono.

- La ejecución 40130297656 volvió a completar Gradle y se detuvo en lectura del certificado: el archivo no contenía líneas que el lector reconociera. El diagnóstico previo de formato v3.1 no queda confirmado por esa salida. Se añade una comprobación independiente de la APK base, con salida pública completa del verificador, como requisito antes de compilar; así se diagnostica con el artefacto existente sin repetir Gradle por cada intento. La comparación de certificado sigue siendo obligatoria y no se ofrece una APK sin verificar.

- Diagnóstico confirmado en la ejecución 40131885246, sin repetir Gradle: Android build-tools 37.0.0 imprime V2 Signer: certificate SHA-256 digest. El digest real de la APK base coincide con fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c. Se añade soporte explícito de ese formato y dos pruebas con la salida observada, conservando el rechazo de claves distintas.
- Retirado el job temporal de diagnóstico una vez obtenida la evidencia, para que el flujo no dependa permanentemente de la retención limitada del artefacto histórico. Se mantiene la comparación con la última release o base disponible después de compilar, y la impresión del certificado público para diagnósticos. Total previsto: 31 pruebas de lógica y nueve de interfaz; el resultado nativo se comprobará antes de ofrecer descargar.

## 24-10-2026 — APK 0.2 probada y ampliación 0.3

- Cerrado el resultado anterior: ejecución 40132206219 en verde, commit 3b6586b; Gradle 11 min 45 s. Verificados certificado e identificador y aumento de compilación 1 → 100019 frente a la APK base. Artefacto territorio-vivo-android-19, ID 12575244663. El usuario la instaló y la considera satisfactoria; plantea los ajustes siguientes. PR [#3](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/3), todavía borrador a develop; sin fusión ni publicación del canal compartido.
- Confirmado explícitamente: dedo arriba → sur, dedo abajo → norte. Actualizados gesto, indicaciones y animación; botones conservan sentido geográfico.
- Selector con enlaces y líneas al mapa: 16 regiones visibles en 360 × 640, blancos de toque de 44 puntos, soporte de texto ampliado mediante desplazamiento cuando haga falta.
- Transición al seleccionar región con mapa del país, línea progresiva, indicador móvil y regiones atravesadas. Duración 1,1–3,6 s, sin guardar regiones intermedias; permite detener y respeta reducir movimiento. Es navegación de interfaz, no ruteo vial.
- Incorporadas 27 referencias comunitarias OSM, 16 regiones, separadas del snapshot heredado. Total 64 referencias, todas pendientes. Identificador/versión/fecha de objetos y consultas con hash; no se importan fotografías, horarios, precios, contactos ni identidades de colaboradores. Extracto ODbL y licencia acompañarán la descarga. Investigación en CATALOGO-NACIONAL.md y procedencia en content/sources/OSM-CHILE.md.
- Consultados datos.gob.cl y SERNATUR. La primera fuente consultada declara CC BY-NC 2.0; no se extrae esa base por ahora y se corrige la interpretación inicial demasiado general. Registrada la distinción del usuario entre catálogo público gratuito y posicionamiento de marcas privadas. Referencias oficiales de nueve parques/reservas documentadas para completar fichas después, sin trasladar anuncios históricos al calendario actual.
- Versión visible 0.3.0, mismo paquete y certificado; número incremental automático. Habilitados build cache y escritura de caché Gradle en ejecuciones propias; forks conservan solo lectura. La mejora se medirá tras una ejecución que guarde resultados; no se promete que toda tarea nativa sea reutilizable.
- Guardadas [vistas funcionales 0.3](diseno/0.3/README.md), diferenciadas de una instalación nativa. Lógica y catálogo: 32 pruebas; interfaz: trece recorridos en Chromium móvil, incluido tamaño pequeño, viaje/cancelación y procedencia OSM. Validación completa previa al push en verde: typecheck, lint, 32 pruebas de lógica, exportaciones Android/iOS/web, build Next.js, trece recorridos de interfaz y formato. Compilación nativa Android pendiente de Actions en este registro.

- Video funcional del recorrido guardado en docs/diseno/0.3/recorrido.webm para revisar el movimiento antes de instalar. Se adjunta a los artefactos junto a las capturas y al extracto/aviso de licencia OSM. Los otros repositorios no se consultan ni modifican en este trabajo.

## 25-10-2026 — Ubicación inicial, navegación interna y descarga simple 0.4

- Cerrada entrega 0.3: ejecución 40136305132 en verde, commit 6c377f1, Gradle 14 min 17 s, compilación 100021 y certificado conservado. Artefacto anterior 12578031596. Usuario probó la APK y solicita rutas reales y ubicación correcta al abrir. Continúa [PR #3](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/3), borrador a develop; no se abrió otra iniciativa ni se fusionó.
- Detectado inicio que consultaba permiso pero no lo pedía en primera ejecución. Se solicita si nunca se decidió y se reutiliza el vigente, respetando denegación/servicios apagados/posición antigua. Región local prevalece sobre geocodificador incompatible; provincia Petorca no se toma como comuna. Hasta obtener GPS reciente se muestra región consultada. No se persisten coordenadas.
- Eliminada acción de cambiar de región al tocar fondo del mapa. Mi viaje incorpora trazado vial OSRM, preview sin GPS entre paradas, cálculo desde ubicación, inicio/detención, seguimiento visual de primer plano, indicadores, ida/vuelta y recálculo al editar/desviarse. Posición, avance y origen solo en memoria; cancelación invalida respuestas anteriores. Sin Google Maps ni servidor público de respaldo.
- El usuario elige explícitamente VPS nuevo separado sin logs de ubicación. Instalación en infra/routing: motor, gateway con límites, HTTPS, imágenes oficiales fijadas por digest, redes internas, logs descartados y volcados desactivados. Servidor real pendiente de contratación/HTTPS/grafo nacional, no se anuncia como desplegado. Guía simple y presupuesto orientativo en SERVIDOR-DE-RUTAS.md; no hay gasto ni servicio productivo creado.
- Prueba local real: 1.252 nodos/330 vías públicas OSM de Arica, extract/partition/customize, rutas con geometría e indicaciones, NoSegment fuera de cobertura, métodos/servicios restringidos, sin caché y sin registros Docker. Caddy valida su configuración; certificado público no probado. Fixtures rotulados, sin GPS de viajeros ni identidades de colaboradores. Se incorpora comprobación del motor en Actions antes de compilar.
- A petición del usuario, instalación separada: artefacto con una única APK; imágenes/videos en repositorio y revisión separada, metadatos en verificación aparte. El enlace estable de release seguirá entregando el .apk directo después de revisión/fusión a develop. Fuente/licencia OSM accesible desde la app, sin obligar a descargar archivos extra junto a la instalación.
- Vistas funcionales en docs/diseno/0.4: La Ligua elegida manualmente y ruta pública de Arica con transporte de prueba. No son GPS físico ni VPS público. Comprobación previa: 56 pruebas de lógica y 14 de interfaz en verde, typecheck, lint, exportaciones Android/iOS/web, Next.js y formato. Se repetirá la validación completa tras los últimos ajustes antes del push; APK nativa pendiente de Actions en este registro.
- Se guardaron instrucciones de arranque y destinos de consulta en borrador del entorno; aplicar el borrador requiere revisar/guardar y publicar en ajustes. No cambia la conexión del teléfono ni crea un VPS. Los otros dos repositorios no se consultaron ni modificaron.
- Corrección de empaquetado del cambio: los archivos infra/routing existían y se probaron localmente, pero quedaron fuera del primer commit 0.4. La ejecución 40146953192 ya había terminado al solicitar la cancelación; se cancela 40146957677 sin ofrecer una descarga, se incorporan los archivos y se repite la validación completa antes del siguiente push.

## 25-10-2026 — Ruteo público temporal sin VPS, candidata 0.4.1

- Entrega 0.4 cerrada en ejecución 40147076648, Gradle 14 min 8 s, compilación 100025, firma e identificador conservados, checksum verificado después de descargar. Artefacto 12581400460 contiene una sola APK; verificación y capturas separadas. El usuario la probó y señala que el requisito de VPS impide calcular caminos.
- El titular fija presupuesto US$0 y autoriza expresamente un servicio público temporal rápido para las pruebas, manteniendo navegación dentro de la app. Esta autorización sustituye la restricción previa de enviar consultas solo al motor propio. No se contrata VPS ni se crean cuentas/secretos.
- FOSSGIS/OSRM preconfigurado: preview entre paradas y navegación ya no requieren pegar URL ni configurar infraestructura. Aviso visible de consultas registradas, condiciones, atribución y corrección de mapa. Desactivar rutas persiste entre aperturas; abrir el catálogo no consulta el motor vial.
- Se conserva la limitación temporal de solicitudes, cancelación de cálculos anteriores y pausa de ubicación al salir de la app. El mapa recibe geometría solo cuando cambia, evitando reenviar recorridos largos en cada lectura de GPS. Máximo 250.000 vértices/32 MB y radio de ajuste de 1 km para no trasladar puntos aislados a carreteras lejanas. Sin historial local de coordenadas.
- Pruebas de lógica, interfaz y capturas usan transporte simulado con respuestas reales de Arica rotuladas como prueba. Se añade integración real en Actions con La Ligua–Papudo y Santiago–La Serena, puntos públicos del catálogo, sin GPS de dispositivos. La APK depende de que ambas consultas pasen, además de la validación completa y prueba del motor propio conservada para el futuro.
- Procedencia, condiciones conocidas y alcance en RUTEO-PUBLICO-DE-PRUEBAS.md. El documento del propio operador consultado en GitHub declara registros, cobertura mundial, una consulta por segundo y no uso intensivo. Los sitios directos del proveedor siguen pendientes de aplicar el borrador de red de Codex; no se afirma haberlos consultado. No se leen ni modifican los otros proyectos.
- Continúa PR [#3](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/3), borrador a develop. Sin fusión ni publicación del canal compartido. Resultado nativo de la candidata 0.4.1 pendiente de Actions en este registro; no anunciarla como descargable antes de confirmar firma y artefacto.

## 25-10-2026 — Búsqueda nacional y navegación orientada, 0.5.0

- Tras probar 0.4.1 en carretera, el titular solicita encontrar negocios de otras regiones, orientar el mapa con el movimiento, permitir explorar y ajustar zoom, y expresar viajes largos en horas. Continúa PR [#3](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/3), todavía abierto/borrador a develop según GitHub; no se fusiona ni se modifica main.
- Búsqueda conserva resultados locales y añade coincidencias de otras regiones con región/comuna visibles, sin cambiar la zona consultada; fichas y guardado de paradas funcionan igual. Normalización de tildes/case y tolerancia de una letra en nombres largos. Caso probado: Matichoc desde Coquimbo → Valparaíso / La Ligua.
- Nueva vista de viaje MapLibre GL JS: arrastrar, pellizcar zoom, girar y ver toda la ruta. Seguir posición se suspende con gestos manuales y se retoma mediante botón; las lecturas GPS no imponen zoom repetidamente. Modo rumbo de avance o norte arriba, posición adelantada para ver más camino. Rumbo del GPS al moverse y cálculo local de dirección si falta curso; al detenerse conserva orientación fiable, sin activar sensores en segundo plano ni guardar historial.
- Duración compartida en ambos paneles: minutos en trayectos cortos; horas y minutos desde una hora (300 min → 5 h). Textos centralizados en idioma.
- MapLibre 5.24.0 obtenido de npm, SHA-512 verificado contra metadatos, BSD-3-Clause y avisos de terceros conservados en distribución. Leaflet permanece para exploración regional. Sin cuentas/cargos ni cambios al servicio público temporal autorizado.
- Pruebas de lógica para búsqueda, tiempos y rumbo; UI para encontrar/guardar Matichoc desde otra región y para orientar/ajustar zoom sin que lo anule otro GPS. Capturas funcionales en docs/diseno/0.5.0. GPS de las pruebas sintético; falta recorrido físico en Android/iOS. APK y firma se validarán en Actions antes de ofrecer descarga. No se consultaron ni modificaron los otros repositorios.

## 26-10-2026 — Catálogo maestro: análisis e integración simulada

- Se conserva el paquete original y sus seis archivos, incluida la instrucción solicitada. Se inspecciona solo conexion_emprende: 64 lugares, 63 localidades, 3 rutas y 22 relaciones de paradas; sin Supabase remoto ni migraciones activas. Se respalda el catálogo actual y se registran hashes de código/recursos y commit base.
- Rama separada feat/catalogo-maestro-simulacion, basada en 739182c para conservar el desarrollo actual. El PR #3 de la app sigue abierto según GitHub al iniciar esta tarea. Esta entrega se deja para revisión local de la simulación, sin push/PR nuevo ni recompilación de APK; no mezcla una publicación de catálogo con la revisión anterior.
- Maestro: 737 filas, 16 regiones, 56 provincias y 346 comunas declaradas. Simulación: 713 nuevos borradores y 24 coincidencias retenidas para revisión; cero reemplazos de fichas existentes, cero cuarentenas por errores estructurales, cero conflictos de distancia detectados, cero publicaciones. Se derivan además 72 nodos de región/provincia. Estado propuesto: 915 entidades más 24 expedientes, sin conectar con la app. Las 305 filas auxiliares no se importan por segunda vez.
- Se conservan íntegros los 130 registros originales y sus relaciones. Los nombres/valores nuevos se guardan como evidencia por campo sin degradar datos previos. Pedegua, presente como localidad y lugar, conserva ambas identidades con namespace y sus IDs originales como alias; no cambia ninguna preferencia del teléfono.
- Contrato extensible para territorios, atractivos, negocios, restaurantes, alojamientos, experiencias, rutas y eventos. Revisión/publicación independientes, varias pertenencias territoriales y acceso/gratuidad/tarifas separados. Diseño de futura base y RLS documentado, sin ejecutar SQL ni afirmar seguridad remota implementada.
- 63 pares de coordenadas del maestro válidos numéricamente, aún sin corroborar. Hay 217 comunas sin atractivos en los insumos disponibles. CUT: 0 de 346 contrastadas. CKAN oficial permitió descubrir fuentes DPA; inventario SERNATUR/MMA bloqueado por túnel HTTP 403, no descargado ni incorporado, CRS/licencia pendientes. No está disponible el CSV original de localidades con separador |; no se afirma exhaustividad.
- Reportes completos y desgloses por región/provincia/comuna en content/staging/catalogo-maestro/simulacion. Importador local sin red ni publicación, con reimportación idempotente y diario de rollback que protege ediciones posteriores. Validación final en verde: 60 pruebas de lógica, 11 del importador y 16 de interfaz; tipos, lint, exportaciones Android/iOS/web, Next.js y formato. Segunda simulación idéntica byte a byte (713 filas sin cambios y 24 expedientes sin cambios); CLI rechaza escrituras fuera de staging. Sin compilación APK nueva. No se modifica producción ni ninguno de los otros repositorios.

## 26-10-2026 — Catálogo incorporado a candidata 0.6 y checklist Excel

- El titular aclara que desea ver todo el maestro en la aplicación de pruebas, pendiente de validación humana, y devolver un Excel con comprobaciones. Esta autorización sustituye la pausa de publicación de referencias pendientes únicamente para la candidata APK, sin producción. No se pide otra confirmación.
- Continúa la rama local anterior, renombrada feat/catalogo-maestro-app. Se prepara [PR #4](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/4), borrador a develop, que incluye el desarrollo de navegación del PR #3 aún abierto; no se fusiona ninguno ni se publica el canal compartido.
- Proyección determinista desde todos los insumos: 429 fichas (64 previas + 365 adicionales), 346 comunas, 16 regiones, 56 provincias, 67 localidades y 3 rutas con 22 relaciones preservadas. Las 737 filas originales conservan ID destino y payload. Veintidós coincidencias exactas asocian evidencia; dos parecidos se muestran separados y pendientes. Nada se declara verificado.
- Búsqueda regional/nacional y mapas leen el mismo export. Las comunas sin atractivos también se pueden encontrar/elegir y persistir; localidad y región se filtran conjuntamente. Nombres territoriales provienen del maestro, sin crear CUT. Sin coordenadas no hay pin ni entrada inventada. El logo y los IDs de Matichoc se conservan.
- Checklist Excel completo con 917 entidades y hojas Cómo usar, Checklist, Origen maestro y Coincidencias. Desplegables, filtros, columnas de corrección, revisor, fecha y evidencia. Lector de devolución admite revisión parcial y genera informe, rechaza IDs alterados/repetidos, filas faltantes, fórmulas y coordenadas inválidas, señala validaciones contradictorias; nunca modifica la app ni publica al leerlo.
- openpyxl 3.1.5/et-xmlfile 2.0.0 fijados; herramientas de Excel solo para desarrollo/CI, fuera del cliente. CI instala en entorno virtual temporal. Se mantiene firma, identificadores y numeración incremental Android/iOS; versión 0.6.0. APK solo en Actions, sin imágenes/documentos extra en el artefacto de instalación.
- Fuentes oficiales CUT/SERNATUR-MMA, licencias y coordenadas siguen pendientes según los informes anteriores; no se inventan descargas ni registros oficiales. No se consultan los otros repositorios ni se activa base remota. Validación completa en verde: 64 pruebas de lógica, 17 de catálogo/Excel y 18 de interfaz; tipos, lint, exportaciones Android/iOS/web, Next.js y formato. Capturas funcionales guardadas en docs/diseno/0.6.0 y mostradas antes de ofrecer descarga. Compilación nativa pendiente de Actions en este registro.

## 26-10-2026 — Valparaíso regional y Rapa Nui, candidata 0.6.1

- Cerrada 0.6.0 en Actions 40324705486, compilación 100035, 99 pruebas y firma compatibles; artefacto 12653160453, Gradle 14 minutos. El usuario observa 11 referencias bajo Valparaíso y pide incluir Rapa Nui con llegada en avión y uso local de la app.
- Diagnóstico: eran las 11 fichas de La Ligua mostradas bajo la región, que tenía 86 referencias, sin pérdida de datos. Se muestra total regional y total comunal por separado, con acceso Ver toda la región. Se mantiene la prioridad de la comuna y las preferencias del teléfono.
- Cuatro referencias OSM acotadas, sin fotografías ni horarios/precios: Anakena, Ahu Tahai, Ahu Toŋariki y Museo Antropológico Padre Sebastián Englert. Valparaíso pasa a 90 referencias; total nacional 433. ODbL, objetos/versiones/hashes y extracto sin identidades de colaboradores en content/sources/rapa-nui. Todo pendiente de revisión; coordenadas son centros, no entradas verificadas. Referencia SERNATUR 2022 para acceso aéreo, sin copiar requisitos históricos como actuales.
- Mi viaje conserva los destinos y separa recorridos del continente/Rapa Nui. Se puede previsualizar el recorrido insular; para iniciar con GPS hay que estar en esa zona. Guardia de dominio antes de consultar rutas, esquema sin conexiones oceánicas, reordenamiento por recorrido y mapa local al elegir isla. Ámbitos técnicos, no límites oficiales. No se contrata alojamiento ni se cambian proveedor o condiciones de privacidad.
- Excel actualizado a 921 entidades y manifiestos versionados. Se acepta el Excel 0.6 de 917 entidades sin descartar revisiones; cuatro nuevas filas pendientes y conflictos explícitos si cambió un dato de origen. No se aplica ni se publica al leer un Excel.
- Continúa [PR #4](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/4), borrador a develop, sin fusiones ni producción. Se amplía la comprobación de rutas reales en Actions con Anakena–Ahu Toŋariki. Validación local completa en verde: 68 pruebas de lógica, 18 de catálogo/Excel y 21 de interfaz; tipos, lint, exportaciones Android/iOS/web, Next.js y formato. Capturas funcionales en docs/diseno/0.6.1, mostradas antes de ofrecer descarga. APK/firma y cobertura real del proveedor en Rapa Nui pendientes de Actions en este registro. No se leen ni modifican los otros repositorios.

## 26-10-2026 — Colección visual por regiones y zonas, candidata 0.7.0

- Cierre anterior 0.6.1: Actions 40367415952 en verde, versión incremental 100037, identidad/firma de pruebas conservadas, una sola APK en artefacto 12672896951. Tres recorridos públicos comprobados, incluido Anakena–Ahu Toŋariki. Sin instalación física realizada por el agente.
- A petición del titular se generan 24 ilustraciones originales: 16 portadas regionales y ocho variantes de zonas. Interior de Petorca, litoral e interior de Valparaíso, Rapa Nui, costas de Choapa/Coquimbo, altiplano y Chiloé tienen identidad propia. Generación con OpenAI image_gen; no son fotos ni referencias turísticas verificadas.
- Selección por región/comuna, categoría de playa para La Ligua y punto focal para ventanas verticales. Las fichas aclaran su carácter ilustrativo; Matichoc mantiene su logo completo. Se eliminan las importaciones de los fondos genéricos previos sin borrar su historial.
- Galería local claro/oscuro, ZIP de revisión y manifiesto de procedencia/hashes en docs/diseno/coleccion-0.7. 24 WebP, 4.596.936 bytes totales, sin cambiar resolución. Originales intactos en el entorno de generación. Colección separada del instalador.
- Continúa PR #4, borrador a develop. No se modifican catálogo, Excel, estados de validación, preferencias, fuentes de datos ni otros repositorios. No se fusiona ni publica producción. Se mantiene identidad y firma para instalar encima de la app base.
- Validación local completa en verde: 71 pruebas de lógica, 18 de catálogo/Excel y 22 de interfaz (111 en total), tipos, lint, exportaciones Android/iOS/web, Next.js y formato. Galería comprobada con sus 24 imágenes cargadas y cambio de tema. Capturas funcionales guardadas en docs/diseno/0.7.0 y mostradas antes de ofrecer descarga. Resultado nativo pendiente de GitHub Actions en este registro; no se anuncia una APK nueva como disponible antes de confirmar su artefacto.

## 26-10-2026 — Propuestas de logo para Territorio Vivo

- Petición «Logo?»: se preparan dos interpretaciones del concepto ventana, cerros, camino y sol, con los colores de la app. Una propuesta transparente para fondo claro y una presentación sobre fondo oscuro, generadas con OpenAI image_gen.
- Archivos de revisión guardados en docs/diseno/marca, con originales intactos y alcance documentado. Los intentos con residuos de transparencia se descartan. Bocetos PNG, sin afirmar que sean vectoriales o una marca definitiva.
- Entrega local para revisión visual, sin push ni nuevo PR. No se integran a la app ni se cambia la APK del PR #4. No se modifica Matichoc, catálogo, producción ni otros repositorios. No se requieren pruebas de aplicación porque solo se guardan imágenes y documentación.

## 26-10-2026 — Exploración de logo v02

- El titular rechaza la primera propuesta por genérica y pide una marca más creativa y disruptiva. Se marca la dirección anterior como descartada y se conservan sus archivos como historial.
- Tres nuevas direcciones con OpenAI image_gen: Pulso (orgánico, coral/fucsia), Cruce (modular, negro/lima) y Vértice (tipografía cinética, ultramar/amarillo). Bocetos guardados en docs/diseno/marca/v02 para comparación; pendientes de elección y refinamiento.
- Solo imágenes y documentación locales, sin push ni PR nuevo, sin modificar APK, temas, catálogo, Matichoc ni producción. No se ejecutan pruebas de app porque no hay cambios funcionales.
