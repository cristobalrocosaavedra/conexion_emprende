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
