# Catálogo maestro: modelo candidato y límites de esta entrega

26-10-2026. Esta entrega cumple la etapa de análisis y simulación pedida por el
usuario. No reemplaza el catálogo que lee la APK y no publica el material nuevo.
La propuesta se implementa en archivos locales reversibles, no en una base remota.

## Estructura observada

- `packages/core/src/catalog.ts` combina `petorca.json` (37 lugares) y
  `osm-chile.json` (27). Exporta 64 lugares, 63 localidades y 3 rutas.
- Las rutas conservan 22 relaciones ordenadas de paradas. Las preferencias del
  teléfono guardan IDs de lugares; cambiarlos rompería viajes guardados.
- La búsqueda regional, las sugerencias nacionales, las fichas y los mapas usan
  ese mismo export. Las coordenadas se filtran antes de calcular rutas.
- La imagen de Matichoc y las ilustraciones están asociadas en `art.ts`; no se
  almacenan como columnas de las fichas. El logo completo sigue siendo la portada.
- Las regiones tienen geometrías Natural Earth; no son límites oficiales CUT.
- `supabase/README.md` confirma que todavía no hay base remota, migraciones,
  usuarios, dueños, reseñas ni panel de oferentes implementados. No se supone que
  existen tablas de producción. No se consultaron otros repositorios.

## Una identidad y especializaciones

El contrato candidato está en `packages/core/src/master-catalog.ts`. El estado
local generado contiene un único conjunto `entities`, identificado por tipo:

| Tipo                   | Especialización prevista                                                   |
| ---------------------- | -------------------------------------------------------------------------- |
| Territorio             | Región, provincia, comuna o localidad; padre; CUT contrastado              |
| Atractivo              | Acceso práctico, naturaleza pública/privada, gratuidad y tarifas separadas |
| Empresa/emprendimiento | Titulares, contactos públicos, horarios                                    |
| Restaurante            | Datos comerciales y categorías gastronómicas                               |
| Alojamiento            | Datos comerciales y categoría de alojamiento; sin reservas implementadas   |
| Experiencia/ruta       | Paradas ordenadas mediante IDs, varias comunas/regiones                    |
| Evento                 | Inicio/fin, zona horaria, organizadores, recinto y cancelaciones           |
| Extensiones futuras    | Tipo con namespace `extension:…` y atributos propios                       |

La categoría es independiente del tipo. Una fila editorial «Ruta patrimonial»
marcada como atractivo no se convierte por sí sola en un itinerario navegable.
Una ficha heredada con categoría gastronomía tampoco prueba que sea restaurante.
Matichoc se identifica expresamente como negocio; no se inventan titulares.

Los eventos futuros necesitarán fechas y organizador comprobados antes de
publicarse. No se crean fechas, teléfonos, horarios ni propietarios vacíos como
si fueran hechos verificados. Los campos desconocidos son `null`, vacíos o están
ausentes, según el contrato.

Cada entidad tiene nombres, categorías, pertenencias territoriales, ubicación de
referencia, estado de revisión, referencias externas y afirmaciones por campo.
Las afirmaciones conservan fuente, valor original, fecha de incorporación,
`verifiedAt` y estado. `verifiedAt: null` significa que nadie verificó ese campo;
la fecha de importación no se presenta como fecha de verificación.

Los identificadores oficiales no se inventan. Los IDs `territory:…` son claves
internas derivadas del maestro; `cut` permanece `null`. La región romana
suministrada se conserva en la afirmación original. La jerarquía región → provincia
→ comuna → localidad queda propuesta, pendiente del contraste oficial.

Para evitar la colisión real de `pedegua`, que ya existe como lugar y localidad,
las claves candidatas usan `legacy:places:…`, `legacy:localities:…` y
`legacy:routes:…`. Conservan el ID anterior en `legacy`, y las relaciones se
adaptan explícitamente. **La app sigue usando sus IDs originales**, sin migración
de preferencias ni cambios a viajes guardados en esta entrega.

## Fuente de verdad y revisión

El archivo `estado-propuesto.json` es el candidato consolidado regenerable, no
una segunda base pública ni una importación automática del auxiliar editorial.
`proposals` contiene expedientes de coincidencia que aún no se incorporan a
`entities`. El estado de revisión sigue perteneciendo a cada entidad candidata;
las propuestas no constituyen otro catálogo para el buscador público.

La correspondencia comienza por `(fuente, identificador externo)` y después por
nombre normalizado, comuna completa, tipo y categoría compatible. Con coordenadas
comparables se calcula distancia: más de 500 metros indica conflicto que requiere
revisión. Las similitudes de nombre también se retienen para revisión; nunca se
fusionan homónimos por nombre solamente. Distintas comunas nunca se unen con esta
regla. Variantes más lejanas pueden escapar a la heurística: «nuevo borrador» no
certifica que el lugar no exista con otro nombre.

Los IDs `CL-POI-…` pertenecen al material editorial entregado; no se presentan como
identificadores oficiales SERNATUR. Las 305 filas auxiliares ya están representadas
en el maestro y **no se importan otra vez**.

Ninguna afirmación nueva reemplaza un valor canónico existente. Cuando un origen
cambia su contenido se agrega evidencia y se señala para revisión. Se mantienen
los documentos originales completos, fuentes OSM/ODbL separadas y sus atribuciones.
El respaldo preserva también geometrías y código de asociación de imágenes y
preferencias, con hashes de los recursos visuales versionados en el commit base.

## Migración futura a Supabase

No se crea ni ejecuta SQL en esta entrega. Cuando se autorice la base, la propuesta
es implementar `entities`, pertenencias territoriales, categorías, referencias de
fuente, afirmaciones por campo, relaciones y tablas específicas para negocios,
alojamientos, rutas y eventos. Un índice/vista de lectura ofrecerá el mismo catálogo
a búsqueda y mapas. Los IDs externos tendrán unicidad por fuente, y la pertenencia
territorial se validará con claves foráneas y una versión identificada de CUT.

El estado local es una especificación de esa migración, no una garantía de que ya
hay RLS o un buscador remoto funcionando. Antes de cualquier dato real remoto:

1. RLS habilitada y denegación predeterminada para staging, evidencias y propietarios.
2. Lectura pública exclusivamente de entidades aprobadas y publicadas, con condiciones
   de reutilización y pertenencia territorial resueltas. `pending` nunca basta.
3. Edición solo de campos autorizados del titular; revisión/publicación reservada a
   moderación. Credenciales de servicio fuera del cliente y de este repositorio.
4. Pruebas de anónimo, propietario, tercero y moderador, y rollback ensayado en desarrollo.

El catálogo heredado ya visible conserva su advertencia de referencia pendiente.
Esta entrega no promueve esos registros a verificados ni amplía su publicación.
