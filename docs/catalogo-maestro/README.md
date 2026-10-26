## Actualización 0.6.1: Valparaíso y Rapa Nui

[Detalle de la corrección](../VALPARAISO-Y-RAPA-NUI.md). El catálogo suma ahora
433 fichas y el checklist 921 entidades, tras añadir cuatro referencias de Rapa
Nui. Las 737 filas originales siguen trazadas. El Excel 0.6 anterior continúa
siendo válido para devolver revisiones; los cuatro registros nuevos quedan
pendientes cuando no estaban en ese archivo. Las cifras de la entrega 0.6 que
siguen a continuación se conservan como antecedente.

# Catálogo maestro: integración en la APK de pruebas 0.6

La indicación posterior del usuario autoriza incorporar el material pendiente a
la app de pruebas y preparar un Excel para su revisión humana. No se requiere otra
confirmación para esta candidata; no se autoriza producción.

- **429 fichas** de lugares/negocios: 64 anteriores y 365 adicionales.
- **346 comunas**, 16 regiones y 56 provincias propuestas; **67 localidades**.
- **3 rutas anteriores**, con sus 22 enlaces de paradas e IDs conservados.
- **737 filas originales trazadas**. Se asocia evidencia de 22 coincidencias
  exactas a sus fichas existentes sin reemplazar sus valores; dos parecidos quedan
  como fichas separadas señaladas para revisión. No se marca nada como verificado.
- Lugares sin coordenadas aparecen en búsqueda/ficha y se pueden guardar; no se
  dibuja un punto ni se les asigna una entrada imaginaria. Solo los puntos
  disponibles se usan para mapas y cálculos, con sus advertencias de referencia.

[Descargar el checklist Excel](Checklist-validacion-Territorio-Vivo.xlsx) y leer
[cómo rellenarlo y devolverlo](VALIDAR-EN-EXCEL.md). Tiene 917 entidades, no 917
atractivos. El archivo original y los informes siguientes se mantienen como
antecedentes; la proyección que lee la app es `content/catalogo/maestro-app.json`,
generada desde el maestro y los snapshots existentes por `scripts/catalogo/entrega.py`.
Hay un solo export de fichas para mapa, búsqueda, detalles y paradas.

## Simulación inicial conservada como antecedente

26-10-2026. Se leyó y siguió la instrucción del ZIP entregado. La rama
`feat/catalogo-maestro-simulacion` conserva el catálogo actual y prepara la
integración en staging, sin publicación ni cambio a la APK.

| Resultado de la simulación            |                                                  Total |
| ------------------------------------- | -----------------------------------------------------: |
| Registros originales conservados      |              130: 64 lugares, 63 localidades y 3 rutas |
| Relaciones de paradas preservadas     |                                                     22 |
| Filas del maestro analizadas          |                                                    737 |
| Nuevos borradores propuestos          |       713: 346 comunas, 363 atractivos y 4 localidades |
| Coincidencias retenidas para revisión |                      24: 5 atractivos y 19 localidades |
| Nodos de región/provincia derivados   |                        72: 16 regiones y 56 provincias |
| Actualizaciones de fichas existentes  |                                                      0 |
| Conflictos de distancia detectados    | 0; las coincidencias no tienen coordenadas comparables |
| Nuevos registros publicados           |                                                      0 |

El estado candidato contiene 915 entidades y 24 expedientes de coincidencia.
No significa que existan 915 atractivos. Se conservan las 305 filas auxiliares
para contraste, sin importarlas como otro catálogo.

Ejemplos que requieren revisión: Playa Lilenes/Playa Los Lilenes y Playa El
Canelillo/Playa El Canelo. Una similitud de nombre puede referirse a **dos lugares
diferentes**. Se retienen ambos antecedentes sin fusionarlos. Los Molles,
Pichicuy y Paseo Atkinson también tienen coincidencias con registros actuales.

- [Reporte de simulación y lista de coincidencias](../../content/staging/catalogo-maestro/simulacion/REPORTE.md).
- [Detalle por región](../../content/staging/catalogo-maestro/simulacion/desglose-region.csv),
  [provincia](../../content/staging/catalogo-maestro/simulacion/desglose-province.csv) y
  [comuna](../../content/staging/catalogo-maestro/simulacion/desglose-commune.csv).
- [Modelo territorial, especializaciones y seguridad](MODELO-Y-SEGURIDAD.md).
- [Cómo reproducir, comprobar idempotencia y revertir](OPERACION.md).
- [Instrucción original sin alterar](../../content/staging/catalogo-maestro/entrada/INSTRUCCION_CODEX_TERRITORIO_VIVO_CATALOGO_MAESTRO.md).

Las 63 coordenadas del maestro pasan rango/formato; su ubicación real y acceso
siguen pendientes. Las 346 comunas necesitan contraste CUT y condiciones de uso.
Hay 217 comunas sin atractivos en los insumos disponibles. El inventario oficial
SERNATUR/MMA no se descargó por bloqueo de red, por lo que no se incorporó ningún
registro de ese recurso ni se verificó su licencia/CRS.

La promoción a fichas verificadas o a un catálogo productivo sigue pendiente del
contraste territorial oficial, fuentes/licencias y las verificaciones correspondientes. La publicación productiva requiere autorización
expresa; el importador de esta entrega no incluye un comando para publicarla.
