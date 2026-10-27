# Territorio Vivo — reglas de trabajo

- Trabajar solo en este repositorio, conexion_emprende. Para consultar, copiar, modificar, instalar o arrancar algo de city_tour o directorio_turistico se requieren dos confirmaciones explícitas del usuario por cada trabajo. Son productos independientes, nunca dependencias.
- Comunicación, documentación de entregas, commits y PR en español. Textos de interfaz en archivos de idioma, español primero y luego inglés y portugués; no fijarlos en componentes.
- Leer docs/PLAN.md y docs/BITACORA.md. Mockup base aprobado: docs/diseno/territorio-vivo-v02.png; respetar temas claro/oscuro, selector lateral y gestos norte/sur.
- Aplicación React Native/Expo para Android e iOS. Compilar APK Android en GitHub Actions, no instalar SDK ni compilar APK en esta máquina. No descartar iOS ni añadir dependencias solo Android sin alternativa documentada.
- Ramas: main ← develop ← feat/fix/docs. PR siempre borrador a develop. No fusionar a main ni modificar producción sin petición expresa.
- Antes de cada push ejecutar validación completa: typecheck, lint, tests, build y formato. No subir resultados en rojo. Build local valida exportación móvil y web; build nativo Android se ejecuta en Actions y debe informarse por separado. Una exportación Metro no es una APK probada.
- No inventar datos turísticos. Ejemplos rotulados y separados del catálogo real. Fuentes, licencias, fechas y estado de verificación explícitos. No reutilizar fotos ni importar directorios sin revisar condiciones.
- RLS estricta antes del primer dato real. Secretos solo en configuración segura; nunca en repositorio, chat, cliente o logs. Ubicación con consentimiento, sin persistir coordenadas ni registrar posición en analítica. No pedir ubicación en segundo plano.
- Explicar cuentas, claves y configuración paso a paso en lenguaje simple. No pedir valores secretos en el chat. Mantener docs/BITACORA.md con fecha, entrega y PR o motivo de ausencia.
- Alcance vigente: maqueta territorial 0.2, catálogo local de referencia, mapas, fichas y selección de paradas. No activar registro de oferentes, backend productivo, pagos ni ruteo real sin nueva petición. La copia de elementos de ambos proyectos se confirmó dos veces para esta ampliación el 24-10-2026, sin modificar los orígenes; no es permiso permanente para otros trabajos.
- Usar este checkout aislado; no crear worktrees salvo petición expresa. Preservar trabajo previo del usuario.

- Antes de ofrecer una descarga nueva, mostrar dos o tres capturas o mockups de las pantallas principales de la candidata y distinguir capturas funcionales de ilustraciones. Guardar esas vistas para revisión.
- Mantener identificadores y firma de la app base, incrementar versionCode y conservar preferencias/paradas con migración de datos cuando cambie el esquema. Una actualización normal se instala encima; no recomendar borrar la app como paso rutinario.
- Canal compartido: releases/latest/download/territorio-vivo-android.apk solo para builds verdes de develop después de revisión/fusión del usuario. Los APK de PR son candidatos y no reemplazan la última versión compartida. No fusionar ni publicar main por cuenta propia.

- Matichoc: portada siempre con su logo o una foto real autorizada de su puesto/toldo de feria. No elegir automáticamente tabletas u otras fotos de producto como imagen principal. Mostrar el logo completo, sin recortar.

- Navegación confirmada tras probar 0.2: dedo arriba → sur; dedo abajo → norte. Selector compacto de 16 regiones con enlaces/líneas; al elegir destino mostrar recorrido visible sobre el país, respetar reducir movimiento y no persistir regiones intermedias. Ver docs/MAQUETA-0.3.md.
- El catálogo OSM se conserva separado, con atribución/ODbL y extracto de datos y licencia adjuntos a la distribución. Revisar condiciones por fuente: no equiparar automáticamente una etiqueta no comercial con prohibición de mostrar cualquier atractivo público, ni suponer que no vender datos elimina toda condición. El negocio previsto es posicionamiento privado rotulado, separado de catálogo público y verificación.

- Alcance ampliado por petición expresa tras 0.3: ubicación al iniciar, rutas por calles y navegación visual dentro de la app, edición y recálculo de paradas. Servidor OSRM propio en VPS nuevo separado, sin logs de ubicación; preparación autorizada, contratación/despliegue pendientes. La regla inicial de no usar demos públicos fue sustituida por autorización expresa del 25-10-2026: permitir temporalmente FOSSGIS/OSRM para pruebas gratuitas, con aviso de consultas registradas, atribución y máximo una consulta por segundo. No abrir Google Maps como sustituto. Mantener navegación de primer plano; coordenadas/recorrido/origen de regreso solo en memoria. Ver docs/SERVIDOR-DE-RUTAS.md. No leer los otros repositorios para este trabajo.

- Descarga Android: artefacto de instalación con una sola APK, sin capturas/videos/documentos. Vistas en repositorio/artefacto de revisión separado; metadatos de firma/checksum en verificación separada. Tras revisión/fusión, el enlace estable de release descarga directamente el archivo .apk. Conservar atribución y acceso al extracto/licencia OSM dentro de la app.

- Decisión vigente: presupuesto US$0, servicio público temporal preconfigurado dentro de la app, sin exigir VPS al viajero. No prometer ausencia de registros del proveedor; app sin historial de coordenadas. Ver docs/RUTEO-PUBLICO-DE-PRUEBAS.md.

- Autorización del 26-10-2026: incorporar todo el maestro aportado a la APK de pruebas como pendiente de validación humana. Asociar evidencia de coincidencias exactas por nombre/comuna/tipo/categoría sin reemplazar los valores heredados; conservar separados los parecidos dudosos. Comunas/localidades en jerarquía y búsqueda, sin inventar coordenadas. Checklist Excel completo para devolver resultados; su lectura genera propuestas y nunca publica automáticamente. No se autoriza producción ni promoción a verificado sin revisión de evidencia.

- Rapa Nui pertenece a Valparaíso: distinguir conteo regional de comuna activa. Los destinos insulares pueden guardarse y recorrerse localmente, con traslado aéreo separado; nunca calcular ni dibujar una carretera al continente. Preservar revisiones de versiones anteriores del Excel cuando el catálogo crezca. Ver docs/VALPARAISO-Y-RAPA-NUI.md.

- Colección visual: 16 portadas regionales y variantes de zonas en apps/mobile/assets/territorio/coleccion. Elegir por territorio y rotular como ilustración; no presentarlas como fotos del negocio ni evidencia de validación. Conservar el logo completo de Matichoc. Registrar procedencia y peso de nuevos assets en docs/diseno/coleccion-0.7/manifest.json; galería y capturas separadas de la APK.

- Marca vigente para integración: Latitud viva, dirección B elegida. Cinco piezas con norte ocre, centro terracota, sur verde y austral turquesa/azul, motivos interiores marfil. Recursos de app en apps/mobile/assets/marca; fuente de ícono Expo Android/iOS y cabecera con ampliación. No confundirla con el logo de Matichoc. Ver docs/diseno/marca/latitud-viva/INTEGRACION.md.
