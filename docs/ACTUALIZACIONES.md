# Actualizaciones de la maqueta

Antes de ofrecer cada descarga se mostrarán tres capturas funcionales de la
candidata: inicio, exploración y ficha. Se guardan con la entrega; no son imágenes
que prometan funciones aún inexistentes. Las ilustraciones de paisaje siguen
identificadas como tales.

## Instalar encima de la base

Android reconoce la actualización por el mismo identificador
`cl.territoriovivo.maqueta`, el mismo certificado y un `versionCode` mayor.
GitHub Actions comprueba esos valores y los compara con la APK anterior. El
número automático es 100000 + número de ejecución; la versión visible comienza
en 0.2.0 para esta entrega. No cambia el identificador para cada versión.

1. Revisa primero las pantallas que compartimos.
2. Descarga la nueva APK y ábrela en el teléfono donde tienes la base.
3. Si Android lo solicita, autoriza instalar desde ese navegador o gestor.
   No necesita permisos de administrador. No desinstales la base.
4. Acepta **Actualizar** y comprueba tus paradas, tema y comuna guardados.

Si aparece un conflicto de firma, detenerse y revisar el artefacto: borrar la app
no es la solución habitual. La base 0.1 no guardaba preferencias; desde 0.2 se
conservan región, comuna, tema y paradas entre aperturas y actualizaciones. Las
coordenadas del viajero no se guardan. El lector conserva datos válidos de esquemas
anteriores y descarta IDs ajenos al catálogo.

Se descarga el APK completo por ahora: actualización incremental de versiones
no significa parches de pocos kilobytes ni actualización automática en segundo
plano. Una distribución por tiendas o actualizaciones remotas de JavaScript se
evaluarán después. Los cambios nativos siempre requieren un binario compatible.

## Un enlace siempre a la última versión compartida

El workflow prepara un canal de pruebas de GitHub Releases. Solo un push a
`develop`, después de la revisión/fusión del usuario y de superar todos los
checks, lo actualiza. Los PR producen candidatos y capturas sin sustituirlo.

El enlace preparado será:
https://github.com/cristobalrocosaavedra/conexion_emprende/releases/latest/download/territorio-vivo-android.apk

No está activo hasta la primera publicación verde de ese flujo. Cada release
conserva su versión, commit, checksum y tres capturas. La subida se prepara como
borrador y se publica solo al completar todos los archivos; un fallo no reemplaza
la anterior. Una ejecución atrasada tampoco puede sustituir una versión mayor.
El canal es de maqueta y no publica en tiendas ni modifica main.

Se conserva la firma pública de pruebas de la base; no sirve para una aplicación
productiva con datos privados. Antes de producción habrá que definir y custodiar
una identidad de firma propia y planificar esa transición.

## Inicio por territorio

Con ubicación consentida, el sistema intenta identificar región y comuna. Para
La Ligua, el inicio muestra Valparaíso → provincia de Petorca → comuna de La Ligua,
con lugares de la comuna primero y luego los de la región. Si no hay permiso o el
sistema no identifica la comuna, se puede escoger manualmente; la interfaz indica
si la selección fue manual. No se presenta una elección manual como GPS real.
La prueba automatizada de estas pantallas usa La Ligua elegida manualmente;
la detección y los permisos nativos se deben comprobar en el teléfono.
