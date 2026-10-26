# Catálogo maestro: resultado para revisión

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

Antes de promover esta propuesta al catálogo visible quedan la revisión de las
coincidencias, el contraste territorial oficial, fuentes/licencias y las
verificaciones correspondientes. La publicación productiva requiere autorización
expresa; el importador de esta entrega no incluye un comando para publicarla.
