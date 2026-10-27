# Colección territorial 01 — Territorio Vivo 0.7.0

24 ilustraciones creadas el 26-10-2026 para sustituir los cuatro fondos repetidos de la maqueta. [Abrir galería](index.html) o [descargar colección](territorio-vivo-imagenes.zip): descomprimir y abrir `index.html`, sin cuentas ni conexión. El ZIP es material de revisión separado; no acompaña al instalador Android.

Son ilustraciones generadas con OpenAI image_gen, inspiradas en el territorio; no fotografías, levantamientos geográficos exactos ni evidencia para validar fichas. La colección no importa fotografías de terceros. Matichoc conserva el logo autorizado y completo, sobre fondo blanco. No se modifica ningún dato, estado de verificación, fila del Excel, parada o fuente del catálogo.

[Vista previa de la galería](vista-galeria.png).

## Portadas y zonas

- 16 portadas: una diferente para cada región, desde Arica y Parinacota hasta Magallanes.
- 8 variantes: interior de Petorca, litoral de Valparaíso, interior de Valparaíso, Rapa Nui, costa de Choapa, costa de Coquimbo, altiplano y Chiloé.
- El inicio elige paisaje según región y comuna activa. Las fichas de playa de La Ligua usan litoral; el resto, interior. Los paisajes de zonas también aparecen en sus fichas y ejemplos de eventos. Una comuna de origen no puede trasladar su ilustración a otra región durante la animación.
- Altiplano se reserva a Putre, General Lagos y Colchane; no se asume que toda Tarapacá sea altiplánica. Las demás comunas sin variante usan la portada de su región. Esta primera colección no representa individualmente todas las comunas ni todos los ambientes de cada región.
- Rapa Nui tiene paisaje separado del puerto de Valparaíso. La ilustración de moái es una composición simbólica, sin atribuirla a un ahu específico; no altera la separación del recorrido insular y continental.
- En el detalle se explica que el paisaje no es una fotografía del establecimiento. Los ejemplos de eventos siguen rotulados como ejemplos; no se crean eventos reales ni promociones.

## Peso, encuadre y archivos

WebP de 1536 × 1024 píxeles, calidad 64/método 6: **4.596.936 bytes en total (4,38 MiB)**, máximo 252.132 bytes por imagen. Los PNG originales de generación se conservan intactos en el entorno de trabajo; el repositorio contiene los WebP finales. Solo se cambió codificación, sin recortar, deformar ni retocar escenas por código.

La ventana vertical encuadra cada paisaje con un punto focal, manteniendo proporciones. La galería permite abrir la escena horizontal completa. Los fondos y miniaturas genéricos anteriores permanecen como historial en el repositorio, pero se quitan de las importaciones de la app. El peso final de la APK se mide en GitHub Actions, no se deduce solo de los archivos.

[manifest.json](manifest.json) conserva dirección artística, motivo por territorio, nombre del original de generación, dimensiones, tamaños y hashes SHA-256 de originales y finales. Los motivos son descripciones editoriales; no son afirmaciones turísticas sobre establecimientos concretos. La dirección artística documentada resume el encargo, no pretende ser la transcripción literal de cada llamada de generación.

## Continuidad

Los IDs de escena permiten agregar variantes por comuna, estación o zona sin cambiar los IDs del catálogo. La selección actual es estable; no se implementa todavía rotación mensual ni descarga remota. Al añadir fotos reales, registrar autor, permiso/licencia y correspondencia con el lugar antes de sustituir una ilustración. Para cambiar estas imágenes empaquetadas se necesita una actualización de app; el catálogo/futuro contenido remoto es una capa separada.

No se activa producción, facturación ni nuevos proveedores. Se mantienen la identidad Android/iOS, firma de pruebas y preferencias de la app base. Continúa el [PR #4](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/4), borrador a develop.
