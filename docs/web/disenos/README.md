# Diseños del sitio web (GPT, 17-11-2026)

**Ilustraciones de diseño, no capturas funcionales.** Generadas por el titular con los
prompts de `../PROPUESTA-SITIO.md` y aprobadas como dirección visual («están
bellísimas»). Todos los nombres, cifras, horarios, teléfonos, reseñas y textos
descriptivos son de ejemplo: no se copian al sitio ni al catálogo.

| Archivo                         | Pantalla                                                  |
| ------------------------------- | --------------------------------------------------------- |
| escritorio-01-inicio-variante-a | Inicio, primera variante (menú antiguo)                   |
| escritorio-02-inicio-variante-b | Inicio, variante elegida: franja de Chile con «Tu región» |
| escritorio-03-region            | Región de Valparaíso, pestaña Qué hacer                   |
| escritorio-04-comuna-explorar   | La Ligua, pestaña Explorar con Mi ruta lateral            |
| escritorio-05-ficha             | Ficha única de negocio                                    |
| escritorio-06-mi-ruta           | Mi ruta entre regiones                                    |
| escritorio-07-suma-tu-negocio   | Suma tu negocio y planes                                  |
| escritorio-08-panel-municipal   | Panel privado, cuenta municipal                           |
| movil-01..04                    | Inicio, comuna, ficha y Mi ruta en celular                |

Huellas SHA-256 en `hashes.txt`.

## Decisión del titular

- Se adopta el aspecto. **Son páginas web: cada página y cada pestaña se recorre con
  scroll y tiene más contenido hacia abajo** que lo que muestra la imagen.
  La barra superior y la fila de pestañas quedan fijas (pegadas arriba) al bajar; en
  celular, la barra inferior con «Mi ruta» queda fija.

## Ajustes al construir (revisión contra las reglas del proyecto)

1. **Menú único:** se usa el de las pantallas 03–08 (Inicio, Destinos, Panoramas,
   Negocios locales, Mis rutas, Favoritos, Mi cuenta) más la píldora «Estás en…» de los
   diseños móviles, que también va en escritorio. El menú de 01–02 queda descartado.
2. **«La Ligua en tu Mano» (móvil 02) no se publica:** la marca [Comuna] en tu Mano y
   su logo con letra solo existen con acuerdo municipal. Sin acuerdo, la comuna usa la
   cabecera normal con su portada ilustrada.
3. **Reseñas y estrellas (4,8 · 126 reseñas):** no hay sistema de reseñas ni datos; no
   se muestran hasta que exista uno aprobado.
4. **Favoritos:** se guardan solo en el navegador, sin cuenta. «Mi cuenta / Acceder»
   lleva al panel privado y se activa con Supabase y petición expresa.
5. **Eventos** (aparece en móvil): queda como pestaña futura; no se muestra vacía ni con
   eventos inventados.
6. **Textos de portada** («Tradición, naturaleza y vida local…», «a pocos kilómetros de
   la capital»): se escriben con fuente o se omiten.
7. **Mi ruta:** el traslado aéreo se dibuja solo entre el continente y Rapa Nui, en el
   punto de la lista donde ocurre; nunca una carretera. Los tiempos los calcula el
   servicio de rutas, no se fijan a mano.
8. **Panel:** cifras de ejemplo; la portada comunal de vista previa solo para cuentas con
   acuerdo.
9. Detalle de texto en móvil 01: «LLa Ligua» → «La Ligua».
10. Imágenes de lugares y negocios: fotos autorizadas o logo completo del titular;
    las ilustraciones regionales de la colección van rotuladas «Ilustración».
