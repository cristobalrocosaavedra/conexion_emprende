# Latitud viva en la aplicación — candidata 0.7.1

El 26-10-2026 el titular pregunta si el diseño recoloreado aparecerá en la nueva compilación y PR. Se integra la dirección B, con norte ocre, centro terracota, sur verde y austral turquesa/azul, en la cabecera y en el ícono de instalación.

## Qué verá el usuario

El símbolo aparece junto al nombre Territorio Vivo en claro y oscuro. Al tocarlo se abre una vista ampliada con la lámina que explica las formas y sus motivos interiores. Cerrar la vista conserva región, tema y paradas. Los rótulos de zonas pertenecen a esa explicación; no aparecen en el ícono de instalación.

El ícono conserva las cinco piezas y detalles marfil de desierto, cordillera, bosque/agua y fiordos/islas. Es una interpretación simbólica, no un mapa ni límites oficiales. Matichoc mantiene su propio logo completo.

## Recursos y plataformas

- `apps/mobile/assets/marca/latitud-viva-icono.png`: fuente cuadrada opaca de 1254 × 1254 para el pipeline de íconos de Expo, compatible con Android/iOS. Generada con OpenAI image_gen a partir de la lámina de color aprobada para integrar; original intacto exec-69311c40-78ec-4d33-8dcf-39c8b64c6a55.png. El tamaño de salida real se inspeccionó; el pedido de 1024 no se presenta como dimensión obtenida.
- `latitud-viva-icono.webp`: codificación optimizada del mismo recurso para la cabecera; sin recortar ni cambiar dimensiones. El PNG fuente de íconos no se importa al JavaScript de la cabecera.
- `latitud-viva-zonas.webp`: codificación optimizada de la lámina explicativa previamente revisada. Se preserva su composición y texto; es una imagen gráfica, no un componente de interfaz con frases fijas.
- Expo `icon` configura Android/iOS y deja que el pipeline genere las densidades nativas. No se declara un foreground adaptativo sin margen comprobado: Expo conserva el ícono completo. No se añaden paquetes solo Android ni se instala SDK local.

Procedencia, dimensiones, tamaños y hashes en [recursos-app.json](recursos-app.json). Las conversiones solo cambian formato/codificación; las ediciones gráficas se realizan con image_gen. Los PNG originales y las rondas descartadas se conservan como historial documental; no se importan a la app.

## Entrega

Candidata 0.7.1, mismo identificador Android/iOS y certificado de pruebas, número incremental asignado por Actions. Se instala como actualización sobre la app base compatible; no se necesita borrar datos. El artefacto de instalación contiene únicamente una APK. Capturas funcionales en docs/diseno/0.7.1 y artefacto separado de pantallas.

Continúa el [PR #4](https://github.com/cristobalrocosaavedra/conexion_emprende/pull/4), borrador a develop; incluye la colección regional 0.7.0 y el catálogo anterior sin cambiar datos, permisos de ubicación, estado de revisión o Excel. Sin fusión ni producción. Compilación nativa en GitHub Actions y verificación de identidad/firma antes de ofrecer descarga; no equivaler exportación Metro con instalación física probada.
