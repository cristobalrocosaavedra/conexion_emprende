# Bitácora

## 24-10-2026 — Plan original

- Plan del producto guardado íntegro en docs/PLAN.md.
- Commit: `4d74eeb`, rama `docs/plan-inicial`.
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
