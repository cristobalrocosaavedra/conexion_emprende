# Revisar el catálogo en Excel y devolverlo

El archivo [Checklist-validacion-Territorio-Vivo.xlsx](Checklist-validacion-Territorio-Vivo.xlsx)
contiene **917 entidades**, incluyendo los datos anteriores y todo el maestro.
No son 917 atractivos: hay territorios, lugares, un negocio y rutas.

1. Descarga el archivo y ábrelo en Excel o LibreOffice. La hoja **Cómo usar** resume
   estas instrucciones. No necesitas una cuenta nueva para revisar los datos.
2. En **Checklist**, usa las flechas de la primera fila para filtrar por región,
   provincia, comuna o tipo. Conserva las columnas grises con los datos actuales.
3. Completa las columnas de encabezado verde. En **Resultado**, elige **Validado**,
   **No validado** o **Pendiente**. Después marca cada comprobación con **Sí**, **No**,
   **Pendiente** o **No aplica**. Lo desconocido sigue pendiente.
4. Si algo está mal, escribe el cambio en **Nombre corregido**, **Latitud corregida**,
   **Longitud corregida** u **Observaciones**. No cambies IDs ni datos actuales.
   Una coordenada de referencia no prueba dónde se entra al lugar.
5. Para marcar validado, confirma nombre, territorio y fuente; también coordenadas
   si hay punto. Añade tu nombre en **Revisor**, **Fecha revisión** y **URL evidencia**.
   La fecha puede ser `2026-10-26`; las direcciones de evidencia comienzan con HTTPS.
   Una comprobación marcada **No** contradice el resultado **Validado**.
6. **Coincidencias** muestra 22 asociaciones exactas y dos parecidos sin fusionar.
   Solo si compruebas un duplicado, copia su ID interno destino en **ID duplicado
   confirmado**. Se revisará antes de unirlo; no se elimina una ficha al marcarlo.
7. Guarda el archivo en formato `.xlsx` y devuélvelo completo en esta conversación.
   No borres las filas sin revisar: también puedes devolver una revisión parcial.

La hoja **Origen maestro** conserva las 737 filas con su ID destino. El catálogo
anterior mantiene sus IDs y coordenadas; no se reemplazó con los datos de la tabla.
No hace falta esperar a completar todas las regiones para enviar avances.

Al devolverlo, el lector comprueba IDs, filas faltantes/repetidas, fórmulas,
correcciones de coordenadas y evidencia. Produce un informe con validados, no
validados, pendientes y contradicciones. **No modifica la app ni publica datos por
leer el Excel.** Los valores corregidos pasan a una propuesta de actualización
revisable, conservando las fuentes y los datos anteriores.

La validación de hechos y la licencia son comprobaciones diferentes. Marcar un
nombre correcto no convierte en libre una fotografía ni demuestra que un acceso
esté abierto. Las condiciones oficiales CUT y SERNATUR/MMA siguen pendientes.

Para desarrollo, los comandos son:

```sh
python3 -m pip install -r scripts/catalogo/requirements.txt
pnpm catalogo:generar
pnpm catalogo:revisar --xlsx /ruta/al/archivo-devuelto.xlsx
```

La opción `--xlsx` admite la ubicación local del archivo devuelto. El resultado se
guarda en `content/staging/catalogo-maestro/trabajo/revision-humana.json`, fuera del
catálogo servido. Una revisión contradictoria se informa y termina con error;
nunca se aplica silenciosamente. El comando directo equivalente es
`python3 scripts/catalogo/entrega.py review --xlsx /ruta/al/archivo-devuelto.xlsx`.
