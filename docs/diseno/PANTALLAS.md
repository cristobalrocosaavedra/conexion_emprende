# Pantallas y primeras APK — plan para revisión

24-10-2026. La prioridad confirmada por el usuario es definir las pantallas y su despliegue, y luego descargar primeras versiones Android. La V02 ya fue aprobada como base visual para avanzar a la APK; el esqueleto y la tecnología se presentan para confirmación antes de construir. No se fijaron fechas.

## Decisiones incorporadas

Nombre elegido para continuar: **Territorio Vivo**. Tema oscuro preferido para la propuesta, con una versión clara de igual estructura. Portada y tarjetas de detalle/eventos parten de B; exploración territorial y selector con mapa parten de A. No se trata de escoger una lámina completa ni de tener dos aplicaciones distintas. La base visual V02 está aprobada. Véase el [esqueleto para confirmar](../ESQUELETO-APK.md). Se acuerdan ahora los detalles de construcción y tecnología, sin activar servicios productivos.

## Orden de revisión

1. Portada y lenguaje visual: usar la [V02 aprobada](territorio-vivo-v02.png); V01 queda como historial.
2. Gesto regional y selector, incluida transición intermedia y extremos.
3. Explorar por provincia/comuna y ficha de ejemplo.
4. Eventos y Mi viaje, con simulación claramente ilustrativa.
5. Estados vacíos, permisos, accesibilidad y comportamiento del botón Atrás.

Revisar una decisión principal por vez. Las primeras APK no necesitan que el nombre definitivo, logo, dominio ni modelo comercial estén resueltos. Los cambios de identidad posteriores deben poder hacerse sin reconstruir la navegación.

## Contrato de cada pantalla

| ID | Pantalla y contenido | Entrada y salida | Estados que debemos revisar |
| --- | --- | --- | --- |
| P01 | Bienvenida: explicación de ubicación y selección manual | Primera apertura → portada elegida | Permiso pendiente, concedido, denegado, ubicación no disponible; nunca bloquear exploración |
| P02 | Portada: región, motivo identificado, categorías y accesos breves | Desde bienvenida, gesto o selector → otra región o detalle | Región física distinta de consultada; extremo norte/sur; textos largos |
| P03 | Menú lateral: mapa interactivo y lista completa norte-sur sincronizados, con región consultada | Abrir desde encabezado → elegir o cancelar | Región actual, salto cercano/lejano, cambio de destino durante animación, reducir movimiento |
| P04 | Explorar: territorio y categorías | Desde portada o pestaña → provincia, comuna o ficha | Todo el territorio, filtro activo, sin resultados; volver conserva filtros |
| P05 | Ficha: ilustración, ejemplo rotulado, tipo de actividad y acción guardar | Desde Explorar/Eventos → guardar o volver | Visitable frente a por encargo/itinerante; no ofrecer parada vial si no corresponde |
| P06 | Eventos: región consultada, categorías y fecha como filtro de demostración | Pestaña → detalle | Sin eventos, filtros; ninguna fecha o disponibilidad ficticia como real |
| P07 | Mi viaje: paradas de ejemplo, origen/destino y modalidad | Guardar desde ficha o pestaña → revisar simulación | Vacío, duplicado, quitar/reordenar, solo ida/ida y vuelta; sin tiempos reales |
| P08 | Simulación visual: trazado esquemático y secuencia de paradas | Desde Mi viaje → volver y editar | Siempre «recorrido ilustrativo, sin cálculo real»; no activar navegación GPS |

Las pestañas Explorar y Eventos siguen la región elegida para explorar. Mi viaje conserva las selecciones entre regiones. La detección física no reemplaza esa elección durante la sesión. Si el usuario cambia región, definir y probar qué filtros territoriales se restablecen; nunca mantener una comuna de una región incompatible.

Propuesta de vuelta atrás: cerrar selector o detalle primero, después volver a su pantalla de origen, manteniendo contexto; no recorrer una por una las regiones mostradas solo durante la animación. Definir persistencia de selecciones de ejemplo antes de construir la APK; recomendación inicial: conservar región manual y viaje de ejemplo localmente, sin coordenadas GPS ni cuentas.

## Límite de la primera APK

Propuesta APK 0.1: bienvenida con elección manual, portada, selector de regiones y gestos, Explorar, ficha, Eventos y Mi viaje con ejemplos locales. Puede desarrollarse en incrementos, entregando una APK temprana de portada/selector si el usuario prefiere probar antes. La detección real de ubicación no bloquea esa primera entrega: acordar si se incluye o queda para la siguiente y no simular un permiso del sistema como si fuera real.

Sin Supabase real, registro de oferentes, moderación productiva, mensajes, reservas, pagos ni mapas/rutas operativos. Sin calificaciones o estadísticas aparentando usuarios reales. Las pantallas se diseñan pensando en esos datos futuros, pero la primera APK solo prueba el recorrido visual. Su construcción requiere aprobación del esqueleto y del alcance de esta maqueta; no se confunde con autorización de Fase 1.

Propuesta APK 0.2: ajustes tras probar el teléfono real; accesibilidad, transiciones, persistencia local acordada y estados sin conexión. Solo incorporar ubicación real si se acuerda y se explica el permiso. Después se redefine el siguiente alcance, sin avanzar automáticamente a backend o rutas.

## Cómo llegará al teléfono

Ruta recomendada a evaluar: Expo con EAS Build, perfil de distribución interna Android y salida APK (no AAB). Permite descargar sin publicar en Google Play. No se necesitan dominio ni cuenta de Play para esta prueba. EAS requiere cuenta, acceso de red, condiciones del servicio y capacidad de build disponible; no se promete que sea gratis ni que ya esté configurado.

Antes de construir, explicar paso a paso:

1. Crear o utilizar una cuenta Expo propia y elegir qué proyecto la alojará. No compartir contraseñas por chat.
2. Fijar identificador interno de Android bajo control del titular, independiente del nombre comercial. Si es una maqueta que se reemplazará, dejarlo explícito.
3. Definir la firma de pruebas y su custodia. Para actualizar una instalación se conserva identificador y clave de firma; respaldar la clave de manera segura y nunca guardarla en Git. Identificar cómo recuperar credenciales si EAS las administra.
4. Configurar el perfil APK interno solo después de aprobar el esqueleto. Un enlace de distribución interna no equivale a confidencialidad: no incluir secretos ni datos privados en el binario.
5. Ejecutar validación completa y build Android; descargar el artefacto real. No presentar una exportación web como APK.
6. Entregar número de versión, commit, tamaño, checksum y cambios junto al enlace real producido por el servicio, sin inventar enlaces.
7. En Android, autorizar la instalación desde la aplicación de descarga si el sistema lo pide, instalar y probar. Mantener Play Protect; no desactivar protecciones para conseguir una instalación.
8. Registrar modelo de teléfono, versión Android y resultado de gestos, Atrás, textos y estado sin red. Desactivar el permiso de instalar aplicaciones desconocidas después si se habilitó solo para la prueba.

Alternativa: build local con Android SDK, JDK y firma de pruebas. Requiere comprobar herramientas y recursos; no está instalado ni validado en esta entrega. La elección del método de build se hace antes de pedir cuentas o configuración.

## Criterio para llamar entregada a una versión

No basta que exista el archivo. Comprobar integridad del APK, instalación y arranque en Android real o emulador; documentar cuál se utilizó y qué queda pendiente en el teléfono del usuario. Revisar todas las pantallas incluidas, sentido norte/sur, extremos, selector rápido, regreso, datos de ejemplo, escala de texto y reducir movimiento. Si no hay dispositivo disponible, informar esa limitación sin afirmar que se probó.

La aprobación visual fue expresada por el usuario: la V02 es la base. La generación de imágenes por sí sola no constituye aprobación de tecnologías ni del esqueleto.
