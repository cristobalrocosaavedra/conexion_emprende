# Turismo en tu Mano — logo y manual de marca 1.0

Logo generado por el titular en GPT el 16-11-2026 con el prompt acordado, a partir de Latitud viva: cinco piezas de Chile por zonas, pin de ubicación, arcos ocre y mano morada que ofrece. Reemplaza la mano dibujada por script en `../latitud-viva/mano/`, rechazada por el titular. Manual: [manual-de-marca-v1.0.pdf](manual-de-marca-v1.0.pdf), 18 páginas, «Equipo Turismo en tu Mano».

- `originales-gpt/`: archivos tal como llegaron (PNG/WebP con transparencia y versión sobre berenjena). No se editan.
- `limpio/`: versiones corregidas con [limpiar.py](limpiar.py), reproducible: sin halo claro en bordes, sin la barra morada sobrante sobre la «i», interiores de letras transparentes, mancha entre dedos retirada, texto en marfil para fondos oscuros e íconos cuadrados sobre marfil y berenjena.
- App: el ícono de instalación y la cabecera usan `icono-marfil` (la mano morada no contrasta sobre berenjena: 1,43:1).
- Hashes en [hashes.txt](hashes.txt).

## Revisión del manual 1.0 (pendientes antes de imprimir o publicar)

1. Usa el logo sin limpiar: en fondos oscuros se ven halos y una mancha entre los dedos (págs. 1, 6, 7, 16, 17). Reemplazar por `limpio/`.
2. Falta un color: la mano es morada (~#5C1C54) y no está en la paleta (pág. 9). «EGG» debe decir berenjena; nombres de colores en español.
3. La mano morada sobre berenjena tiene contraste 1,43:1 (pág. 6 «App / oscuro», 7, 16, 17): necesita placa marfil o una variante de mano clara aprobada.
4. Sellos de la pág. 14 contradicen la pág. 10: texto blanco sobre ocre (1,99:1), verde (3,57:1) y terracota (3,97:1) no cumple AA. Usar texto berenjena (8,62 / 4,82 / 4,33:1).
5. Falta la versión de una tinta (pág. 7 la nombra pero no la muestra) y la versión de texto para fondo oscuro.
6. Pág. 11 muestra «Turismo en tu Mano» en una fuente de reemplazo, no Nunito Sans; el logotipo es un dibujo propio, distinto de la fuente de títulos.
7. Pág. 13: si el color del marcador indica zona, en un mapa local todos los marcadores saldrían del mismo color. Decidir si el color del marcador indica categoría (y la zona queda para regiones y portadas).
8. Íconos de la pág. 12: artesanía, tour y natural son ambiguos; conviene una familia abierta y consistente (licencia libre) con estilo redondeado.
9. Textos encimados en págs. 3, 10 y 18, y botones ilegibles en la pág. 16.
10. El logo es imagen generada (mapa de bits). Para imprenta y señalética falta una versión vectorial redibujada.
