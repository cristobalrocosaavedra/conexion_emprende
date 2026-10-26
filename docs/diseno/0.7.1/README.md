# Capturas funcionales — candidata 0.7.1

Exportación web móvil de la aplicación, comprobada con Playwright el 26-10-2026. No son interfaces generadas con IA: muestran el código y los recursos realmente integrados. El símbolo y las ilustraciones sí proceden de la generación gráfica documentada.

- [Inicio](pantalla-inicio.png): logo en la cabecera y contexto de La Ligua/Petorca. Comuna elegida manualmente; sin GPS físico.
- [Símbolo ampliado, oscuro](pantalla-marca-oscuro.png) y [claro](pantalla-marca-claro.png): cinco piezas con colores por zona, imagen completa en teléfono de 360 × 640, cierre conservando las paradas. Capturas esperan decodificación y repintado; no se capturan transiciones incompletas.
- [Mi viaje](pantalla-ruta.png) y [mapa](pantalla-mapa.png): navegación y controles conservados; transporte/GPS simulados con fixtures de prueba, teselas externas bloqueadas en las pruebas de UI. No equivalen a conducción física ni a disponibilidad del proveedor en ese momento.

112 pruebas locales: 71 lógica, 18 catálogo/Excel y 23 interfaz; validación completa y prueba enfocada del logo en verde. La compilación Android, la firma y los recursos nativos se comprueban aparte en GitHub Actions. No se compila una APK localmente ni se afirma instalación física del agente.

Las vistas se muestran antes de ofrecer la nueva descarga. Identificadores y certificado se conservan; la actualización compatible mantiene preferencias y paradas. Artefacto de instalación con una sola APK y capturas/metadatos separados. Continúa [PR #4](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/4), borrador a develop.
