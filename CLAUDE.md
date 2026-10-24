# Territorio Vivo — reglas de trabajo

- Trabajar solo en este repositorio, conexion_emprende. Para consultar, copiar, modificar, instalar o arrancar algo de city_tour o directorio_turistico se requieren dos confirmaciones explícitas del usuario por cada trabajo. Son productos independientes, nunca dependencias.
- Comunicación, documentación de entregas, commits y PR en español. Textos de interfaz en archivos de idioma, español primero y luego inglés y portugués; no fijarlos en componentes.
- Leer docs/PLAN.md y docs/BITACORA.md. Mockup base aprobado: docs/diseno/territorio-vivo-v02.png; respetar temas claro/oscuro, selector lateral y gestos norte/sur.
- Aplicación React Native/Expo para Android e iOS. Compilar APK Android en GitHub Actions, no instalar SDK ni compilar APK en esta máquina. No descartar iOS ni añadir dependencias solo Android sin alternativa documentada.
- Ramas: main ← develop ← feat/fix/docs. PR siempre borrador a develop. No fusionar a main ni modificar producción sin petición expresa.
- Antes de cada push ejecutar validación completa: typecheck, lint, tests, build y formato. No subir resultados en rojo. Build local valida exportación móvil y web; build nativo Android se ejecuta en Actions y debe informarse por separado. Una exportación Metro no es una APK probada.
- No inventar datos turísticos. Ejemplos rotulados y separados del catálogo real. Fuentes, licencias, fechas y estado de verificación explícitos. No reutilizar fotos ni importar directorios sin revisar condiciones.
- RLS estricta antes del primer dato real. Secretos solo en configuración segura; nunca en repositorio, chat, cliente o logs. Ubicación con consentimiento, sin persistir coordenadas ni registrar posición en analítica. No pedir ubicación en segundo plano.
- Explicar cuentas, claves y configuración paso a paso en lenguaje simple. No pedir valores secretos en el chat. Mantener docs/BITACORA.md con fecha, entrega y PR o motivo de ausencia.
- Alcance vigente: maqueta territorial 0.2, catálogo local de referencia, mapas, fichas y selección de paradas. No activar registro de oferentes, backend productivo, pagos ni ruteo real sin nueva petición. La copia de elementos de ambos proyectos se confirmó dos veces para esta ampliación el 24-10-2026, sin modificar los orígenes; no es permiso permanente para otros trabajos.
- Usar este checkout aislado; no crear worktrees salvo petición expresa. Preservar trabajo previo del usuario.

- Antes de ofrecer una descarga nueva, mostrar dos o tres capturas o mockups de las pantallas principales de la candidata y distinguir capturas funcionales de ilustraciones. Guardar esas vistas para revisión.
- Mantener identificadores y firma de la app base, incrementar versionCode y conservar preferencias/paradas con migración de datos cuando cambie el esquema. Una actualización normal se instala encima; no recomendar borrar la app como paso rutinario.
- Canal compartido: releases/latest/download/territorio-vivo-android.apk solo para builds verdes de develop después de revisión/fusión del usuario. Los APK de PR son candidatos y no reemplazan la última versión compartida. No fusionar ni publicar main por cuenta propia.

- Matichoc: portada siempre con su logo o una foto real autorizada de su puesto/toldo de feria. No elegir automáticamente tabletas u otras fotos de producto como imagen principal. Mostrar el logo completo, sin recortar.
