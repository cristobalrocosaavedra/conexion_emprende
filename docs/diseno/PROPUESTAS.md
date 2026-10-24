# Mockups base — V02 aprobada e historial

24-10-2026. Mockups de Fase 0, no pantallas implementadas. Sin logo y con nombre provisional. Toda ficha, evento, oferta o recorrido dibujado es de ejemplo; las ilustraciones regionales son referencias visuales, no documentación turística.

## Base visual aprobada

El usuario confirma que las [pantallas V02](territorio-vivo-v02.png) son la base para construir la primera maqueta Android. El selector con mapa será un menú lateral y sus regiones se podrán seleccionar desde mapa o lista. La aprobación visual no sustituye la confirmación del [esqueleto técnico](../ESQUELETO-APK.md) solicitado antes de crear la aplicación.

Inicio localizado: región completa y prioridad de eventos y contenido cercanos; ejemplo La Ligua → Petorca → Valparaíso. La obtención de posición requiere consentimiento. Los grupos norte/centro/sur/extremo sur y destacados del viaje son una ampliación a diseñar sobre el selector aprobado, no una nueva geografía oficial.

## Dirección elegida: mezcla de A y B, con preferencia oscura

El usuario elige **Territorio Vivo** como nombre de la app. Se deja atrás la elección excluyente A/B: una sola experiencia combina las piezas de ambas propuestas.

- **Portada e identidad:** preferencia por el ambiente oscuro e inmersivo de B.
- **Exploración por provincia/comuna:** jerarquía, distribución y lectura de A, adaptadas también al tema oscuro.
- **Selector territorial:** mapa esquemático y lista de regiones de A. No convertir el inicio en un mapa protagonista ni usar la silueta generada como cartografía real.
- **Detalle de emprendimientos y eventos:** estilo de tarjetas de B, con ilustración y contenido legible.
- **Tema:** ofrecer claro y oscuro con la misma información, estructura, navegación y acciones. La preferencia personal del usuario es oscuro; no define por sí sola el valor inicial para todos.

Propuesta técnica por confirmar al construir: opciones Sistema / Claro / Oscuro, siguiendo inicialmente el sistema y recordando una selección manual en el dispositivo. Colores mediante tokens semánticos (fondo, superficie, texto, acento, borde, estado), sin duplicar pantallas ni ligar lógica de negocio al tema. Contraste y foco se verifican en ambos modos. La portada puede tener variantes de ilustración compatibles, sin duplicar todo el catálogo de recursos por tema.

La [lámina V02](territorio-vivo-v02.png) compara portada, exploración territorial y selector en ambos temas. No cierra automáticamente los detalles de Eventos y Mi viaje: se revisarán en su propia lámina. El usuario aprobó V02 como base visual; los estados detallados se afinan al construir. El esqueleto y la tecnología se presentan para confirmación separada.

## Versión 01 — alternativas originales

## Dos direcciones para comparar

**A · Territorio vivo — recomendada.** Marfil, azul petróleo y coral. Ilustraciones simples de paisaje y arquitectura, tipografía legible, tarjetas amplias y superficies claras. Deja que cada región cambie de motivo sin que cambien los controles. Favorece una lectura fácil y un catálogo que mezcla turismo y comercio.

**B · Ventanas de Chile.** Azul noche, turquesa y crema. Paisaje más inmersivo, bloques geométricos y tarjetas claras superpuestas. Más protagonismo del viaje y una atmósfera nocturna. Debemos cuidar el contraste y que la ilustración no compita con el contenido.

La recomendación inicial de probar A primero queda reemplazada por la mezcla elegida arriba. No interpretar la lámina como especificación exacta de tipografía, espaciado o datos. La generación visual puede introducir diferencias de texto: los requisitos de este documento y PLAN.md prevalecen.

## Pantallas y estados a diseñar

| Pantalla            | Debe mostrar                                                       | Acción principal                        |
| ------------------- | ------------------------------------------------------------------ | --------------------------------------- |
| Entrada             | Elegir región o permitir ubicación, con explicación breve          | Entrar a una región sin exigir cuenta   |
| Portada regional    | Región, motivo ilustrado identificado, tarjetas y pistas Norte/Sur | Cambiar región o abrir contenido        |
| Selector regional   | Lista norte-sur y región actual                                    | Saltar con tránsito visual intermedio   |
| Explorar            | Región → provincia → comuna, categorías y tarjetas                 | Abrir una ficha o guardar para el viaje |
| Ficha               | Ejemplo rotulado; a futuro fuente, vigencia y verificación         | Añadir parada cuando sea visitable      |
| Eventos             | Región consultada, filtro temporal y ejemplos sin fechas reales    | Ver detalle                             |
| Mi viaje            | Selección de ejemplo, origen/destino e ida/vuelta                  | Revisar una simulación ilustrativa      |
| Sin contenido/error | Mensaje honesto y alternativa de región/categoría                  | Recuperar navegación sin inventar datos |

La lámina muestra una selección de pantallas para comparar dirección artística, no todos estos estados. La maqueta posterior debe cubrirlos sin implementar servicios productivos.

## Composición de la portada

1. Región consultada y selector en el encabezado. Si se está lejos de la ubicación física, no cambiar la región automáticamente.
2. Motivo regional con una etiqueta del lugar representado y «Ilustración de referencia». Evitar texto encima de zonas sin contraste.
3. Pocas tarjetas visibles: descubrir, eventos y emprendimientos. No comprimir un catálogo entero dentro de la portada.
4. Acceso a territorio por provincia y comuna desde Explorar, con ruta de navegación visible.
5. Pistas «↑ Norte» y «↓ Sur» y controles alternativos accesibles. Ocultar la dirección imposible en cada extremo.
6. Navegación persistente: Chile, Explorar, Eventos, Mi viaje (nombres provisionales, en archivos de idioma al implementar).

La portada responde al gesto vertical con cambio de región; las listas y detalles tienen sus propias vistas desplazables. Una tarjeta no cambia la región solo por rotar su imagen. Acciones de guardar, filtros y listas no deben disparar el gesto regional accidentalmente.

## Movimiento, recursos y accesibilidad

Recorrer regiones intermedias sin peticiones de red por cada una. Ensayar 100–200 ms por región, con un límite total; cambiar de selección interrumpe el movimiento anterior. Precargar solo vecinos inmediatos. No cargar todos los negocios ni imágenes del país para una transición.

Preferir ilustraciones vectoriales estáticas o WebP/AVIF según soporte validado. Objetivo inicial de presupuesto para la maqueta: motivo regional raster de hasta 150 KB y miniaturas de hasta 50 KB; son metas por medir, no tamaños ya logrados por las imágenes de propuesta. La lámina de revisión no se incluirá como recurso de la app. No usar GIFs pesados ni videos de fondo.

Reducir movimiento desactiva el tránsito animado largo. Contraste WCAG AA, textos escalables, áreas táctiles objetivo de al menos 48 unidades lógicas en Android, etiquetas para lector de pantalla y acceso sin depender solo del gesto. No transmitir estado solo por color. Comprobar manualmente en dispositivo al construir.

## Cómo revisar esta entrega

La mezcla y el nombre Territorio Vivo ya fueron elegidos. Ahora revisar la portada y el salto regional, y después los detalles. El nombre no condiciona la estructura de navegación. Logo, fotografías definitivas, algoritmo de rotación, ranking y espacios comerciales se diseñan más adelante.

La lámina está guardada en [propuestas-visuales-v01.png](propuestas-visuales-v01.png). Es un PNG de revisión; no es un recurso optimizado de la app. El mapa dibujado es esquemático y no debe usarse como cartografía ni como geometría regional. Véase también el [detalle de pantallas y primeras APK](PANTALLAS.md).
