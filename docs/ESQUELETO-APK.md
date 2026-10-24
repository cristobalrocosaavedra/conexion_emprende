# Territorio Vivo — esqueleto y primera APK

24-10-2026. Base visual V02 aprobada. El usuario indica avanzar con cambios y subida a GitHub para generar la APK mediante GitHub Actions, y pide contemplar iOS nativo desde el inicio. Se construye el esqueleto con Expo/React Native y monorepo; la configuración de backend y los servicios productivos siguen fuera de alcance.

## Alcance de la construcción propuesta

Un monorepo, con la app Android como prioridad. La web empieza mínima; no se construyen paneles de administración ni registro de oferentes. La primera APK implementará las pantallas acordadas como maqueta interactiva, sin servicios productivos ni funciones de ruteo real.

```text
apps/
  mobile/
    app/                  Entrada, pestañas y vistas de detalle
    src/
      components/         Tarjetas, portada y selector lateral
      features/           Territorio, explorar, eventos y viaje de ejemplo
      services/           Datos locales y ubicación con permiso
      theme/              Sistema, claro y oscuro como propuesta
    assets/               Ilustraciones optimizadas y mapa de navegación
    app.config.ts         Permisos e identidad Android de pruebas
    # APK generada por .github/workflows/apk-android.yml, sin EAS
  web/                    Next.js: página mínima independiente
packages/
  core/                   Territorio, navegación, contratos y validación
  i18n/                   Mensajes de interfaz por idioma, español primero
  design-tokens/          Paletas y medidas compartidas
content/
  examples/               Ejemplos rotulados y separados de datos reales
  sources/                Manifiestos de procedencia/licencia de datos reales
supabase/                 Documentación de integración; sin base remota aún
.github/workflows/        Validación del monorepo
AGENTS.md                 Reglas del proyecto y límites entre repositorios
CLAUDE.md                 Las mismas reglas para otros asistentes
docs/                     Planes, referencias visuales y bitácora
```

Los directorios base ya se crearon; los módulos de funciones futuras se incorporan progresivamente, no como archivos vacíos aparentando funcionalidad. No copiar los PNG completos de mockups como si fueran pantallas funcionales: sus elementos se construyen como componentes y sus ilustraciones se preparan como recursos separados. El mapa artístico de la lámina no se calca como geografía oficial.

## Tecnología adoptada para el esqueleto

| Área                   | Elección propuesta                                         | Motivo y alcance                                                                       |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| App Android            | Expo + React Native + Expo Router                          | App instalable, navegación y acceso a permisos nativos                                 |
| Lenguaje y repositorio | TypeScript, pnpm workspaces y lockfile congelado           | Tipos y dependencias reproducibles                                                     |
| Web                    | Next.js                                                    | Base para presentación y futuros paneles; no bloquea probar la app                     |
| Mapa del menú          | SVG local con regiones seleccionables y lista accesible    | No requiere servidor de mapas para elegir región; geometría con procedencia comprobada |
| Gestos y movimiento    | Herramientas compatibles con el SDK Expo elegido           | Gesto norte/sur, cancelación y reducir movimiento                                      |
| Ubicación              | expo-location en primer plano, si se confirma para APK 0.1 | Obtener posición solo con permiso y resolver territorio sin persistir coordenadas      |
| Estado inicial         | Estado local y persistencia acotada                        | No requiere cuentas ni sincronización para probar navegación                           |
| Backend futuro         | Supabase, Postgres y PostGIS con RLS estricta              | Catálogo, pertenencia a territorios y permisos; no crear proyecto remoto ahora         |
| CI                     | GitHub Actions                                             | Typecheck, lint, tests, build y formato antes de cada push                             |
| APK                    | GitHub Actions + Expo prebuild + Gradle                    | Compila en runner GitHub, sin SDK local ni cuenta EAS; artefacto de prueba descargable |

Comprobación técnica realizada: Node 24.19.0 y Java 21 presentes. No se localizaron adb, sdkmanager ni EAS CLI; ANDROID_HOME y ANDROID_SDK_ROOT no están definidos. Esto no prueba que el usuario carezca de cuenta Expo: aún no se intentó autenticación. El registro npm devolvió expo 58.0.19, expo-router 58.0.26 y react-native-svg 15.16.0. Son observaciones de disponibilidad, no una matriz de compatibilidad aprobada. Las versiones de React Native y módulos se elegirán mediante las recomendaciones del SDK y comprobación de Expo, sin mezclar versiones latest arbitrariamente. La documentación oficial Expo devolvió 403 del proxy; se guardaron los dominios para desbloquear su revisión.

## Flujo funcional de la primera maqueta

1. Explicar ubicación y ofrecer elegir región manualmente. Con permiso y posición disponible, abrir su región; sin permiso, no bloquear la app ni fingir una localización.
2. Mostrar región completa con prioridad cercana. Ejemplo del usuario: La Ligua → provincia de Petorca → región de Valparaíso. Cercanía no equivale a haber verificado los establecimientos.
3. Abrir el menú lateral desde el encabezado: mapa seleccionable y lista de las 16 regiones. Una selección en cualquiera actualiza la otra y lleva al mismo destino.
4. Representar norte, centro, sur y extremo sur como agrupaciones editoriales; límites de esas agrupaciones todavía por definir. No alterar la división administrativa.
5. Al saltar de región, recorrer sus portadas intermedias; cerrar el menú antes del tránsito. Los destacados guardados del viaje pueden señalarse en el mapa o lista, sin inventar tiempos ni relaciones de conectividad vial.
6. Explorar, Eventos y fichas responden a la región consultada. Eventos pueden abrirse y guardarse; una ficha solo ofrece añadir una parada visitable cuando corresponde. El guardado de un evento no promete que la ruta permita llegar a tiempo.
7. Mi viaje conserva selecciones entre regiones y muestra un esquema ilustrativo, sin motor real ni navegación GPS.

Primer plano territorial: priorizar comuna, provincia y luego región con etiquetas de alcance. No presentar contenido lejano como cercano para llenar huecos. Al explorar voluntariamente otra región, sus listas corresponden a esa región; no se sobreescriben por la ubicación física. Incluir una acción explícita para volver a Mi zona.

La resolución geográfica de posición a territorio necesita límites con fuente y licencia validadas. Si falta precisión, informar y permitir corregir la comuna; no decidir por proximidad a una capital como si fuera pertenencia oficial. Coordenadas solo en memoria y sin logs, analítica ni persistencia. Si la resolución local no cabe aún en el primer incremento, entregar selector manual y declarar la detección real como pendiente, sin simularla.

## Catálogo basal y ejemplos

El usuario autoriza iniciar la preparación de datos públicos nacionales. Se hará un inventario con condiciones de uso por conjunto y procedencia por registro, separado de los ejemplos. Incorporar una fuente pública no transforma automáticamente sus datos en verificados por Territorio Vivo. La documentación en [FUENTES-DATOS.md](FUENTES-DATOS.md) registra lo investigado y lo bloqueado.

No se bloquea la navegación de maqueta por tener regiones aún sin catálogo: mostrar estado sin datos. No cubrir otras regiones con lugares ficticios aparentando ser reales. No copiar fichas, textos, fotos ni código de los otros repositorios sin las dos confirmaciones exigidas para ese trabajo; la mención de que podrían servir como referencia no se cuenta como ambas.

## Validación y entrega Android

Validar lógica norte/sur y extremos; sincronización mapa/lista; cambios y cancelación; separación de región física/consultada; estados sin permiso ni datos; temas; etiquetas de ejemplo y botón Atrás. Probar compilación móvil real además de build web. Core se verifica con pruebas de comportamiento, no con comprobaciones triviales de implementación.

Para el método elegido, documentar firma de pruebas, identidad Android, workflow y descarga en [ANDROID-CI.md](ANDROID-CI.md). No se usa EAS ni se pide cuenta Expo para compilar en GitHub. Nunca pedir valores de claves en el chat. Antes del primer push, todas las comprobaciones completas en verde. Crear PR borrador a develop, sin fusionar. La APK solo se llama entregada al existir el artefacto y comprobar su instalación/arranque, indicando dispositivo o emulador utilizado. Registrar versión, commit, checksum, tamaño, enlace real y limitaciones.

## Estado de la primera entrega

Esqueleto implementado en feat/base-android-ci, desde la base develop y conservando los commits documentales. Incluye portada esquemática, temas, selector mapa/lista, tránsito entre regiones y pestañas con estados sin datos. No detecta ubicación, no importa catálogo, no guarda paradas todavía ni calcula rutas. El mapa es un esquema táctil, no límites administrativos oficiales. Son límites explícitos de la primera versión, no funciones dadas por terminadas.

Node 24.19.0, pnpm 10.33.0, Expo 58.0.19, React Native 0.88.0 y Expo Router 58.0.26 fijados usando la plantilla oficial disponible en npm; TypeScript 6.0.3 y Next.js 16.4.3. Exportaciones JS Android/iOS y web verificadas; eso no demuestra compilación nativa iOS ni instalación de APK. El build Android nativo se ejecutará exclusivamente en GitHub Actions. Los directorios nativos generados son ignorados; no se instaló Android SDK ni se compiló APK local.

La validación completa y el resultado de push, PR y ejecución remota se registran por separado en la bitácora. El [presupuesto y freemium](COSTOS-Y-MONETIZACION.md) es una propuesta para decidir: no se activaron cobros.
