# Descargar la maqueta Android desde GitHub

La APK se compila en **GitHub Actions**, no en el entorno de trabajo ni en EAS.
No necesitas instalar Android Studio ni crear una cuenta Expo para este flujo.
El código usa Expo y React Native para Android e iOS; el primer artefacto es
Android ARM64. Un iPhone no puede instalar una APK.

## Qué hace el workflow

1. Ante un push de rama de trabajo, PR a develop o ejecución manual, instala las
   versiones fijadas por el lockfile y ejecuta typecheck, lint, tests, build y
   formato. No compila APK si falla esa validación.
2. En un runner Ubuntu instala Java y las herramientas Android. Acepta las
   licencias del SDK mediante la acción de preparación Android, como parte de
   este método de compilación autorizado.
3. Genera Android desde la configuración Expo versionada. Los directorios
   Android/iOS generados no se guardan en Git.
4. Verifica el checksum oficial de Gradle y ejecuta `assembleRelease` solo para
   ARM64. La aplicación lleva su JavaScript incluido y no necesita Metro en tu
   computador para abrirse. No es una publicación productiva.
5. Comprueba firma y presencia del bundle y adjunta APK, commit y SHA-256 como
   artefacto. Conservación inicial: 14 días. Las acciones están fijadas por SHA.

Se utiliza la **firma pública de desarrollo** de la plantilla Expo, confirmada
al inspeccionar el proyecto generado. Sirve para esta maqueta sin datos privados;
no es identidad de producción ni una clave secreta propia. Antes de un piloto
real se configurará firma controlada por el titular en secretos de GitHub, sin
archivos de clave en el repo. El identificador provisional es
`cl.territoriovivo.maqueta`; cambiar identificador o firma puede exigir reinstalar.
La versión inicial es 0.1.0; aún no se distribuye por tiendas.

La compilación se ejecuta también por push a ramas feat/fix, por lo que no
requiere fusionar nada en main o develop para obtener la APK. Los cambios en
ramas docs solo validan; no disparan compilación nativa. Si se abre un PR además
del push, puede haber dos ejecuciones iniciales; se cancelan ejecuciones obsoletas
del mismo ref. Revisar consumo antes de ampliar frecuencia o arquitecturas.

## Pasos en lenguaje simple

1. Entra al repositorio `cristobalrocosaavedra/conexion_emprende` con tu cuenta
   GitHub y abre la pestaña **Actions**.
2. Abre **Validación y APK Android de pruebas** y elige la ejecución de la rama
   `feat/base-android-ci`. Espera a que validar y compilar estén verdes.
3. Al final de esa ejecución, abre **Artifacts** y descarga el archivo cuyo nombre
   empieza por `territorio-vivo-android-`. GitHub puede pedir que inicies sesión.
4. Descomprime el ZIP. Dentro estarán la APK y los archivos con commit y checksum.
   Pasa la APK al teléfono Android ARM64 o descarga el ZIP directamente en él.
5. Abre la APK. Android puede pedir permiso temporal para instalar desde tu
   navegador o gestor de archivos. Permite esa fuente solo si reconoces el
   artefacto de este repositorio. No desactives Play Protect.
6. Prueba portada, selector de regiones, Norte/Sur, pestañas y tema. Es una primera
   base funcional; todavía no detecta ubicación ni tiene catálogo o rutas reales.
7. Anota modelo del teléfono, versión Android y qué funcionó o falló. Desactiva el
   permiso de instalar desde esa fuente cuando termines si lo habilitaste solo
   para la prueba.

Si falla una ejecución, no descargues como nueva versión un artefacto viejo.
Guarda el enlace de la ejecución fallida para diagnosticar el paso concreto.
La primera ejecución nativa debe completarse antes de afirmar que existe una APK
instalable. Exportar bundles Android/iOS en esta máquina no demuestra instalación.

## iOS desde el inicio

La misma base declara iOS y exporta su JavaScript. No hay APIs Android exclusivas
en los componentes, no se solicitan permisos de ubicación todavía y el selector
funciona con React Native/SVG. Se deben probar posteriormente safe areas,
accesibilidad, gestos y botón de regreso con las convenciones de iPhone.

Para una compilación nativa de iOS se necesita un runner macOS con Xcode. Para
instalar en iPhones de otras personas se definirá firma, cuenta Apple Developer,
identificador y TestFlight o distribución de pruebas permitida. Esos costos y
pasos se aprobarán antes de añadir ese workflow. No se afirma que el build nativo
iOS esté probado por haber exportado su JavaScript.

## Configuración y acceso

El workflow de esta maqueta no necesita secretos propios, token Expo ni claves
Supabase. GitHub puede requerir habilitar Actions o aprobar acciones de terceros
en las políticas del repositorio. Es una configuración de GitHub, no una razón
para compartir contraseñas o tokens por chat.

La API de GitHub estaba bloqueada por 403 del proxy durante la preparación;
se guardó api.github.com y luego volvió a responder: el PR #1 ya está abierto como
borrador a develop. La validación remota pasó, pero el primer build nativo falló.
Para diagnosticarlo, los hosts de logs results-receiver.actions.githubusercontent.com
y productionresultssa19.blob.core.windows.net deben habilitarse en el entorno;
sus descargas siguen bloqueadas con 403. Los dominios están guardados en borrador.
No hay APK comprobada todavía. El resultado se registra en la bitácora.
