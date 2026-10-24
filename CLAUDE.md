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
- Seguir el alcance aprobado: cascarón y maqueta de Fase 0, sin activar registro de oferentes, backend productivo, pagos ni ruteo real de fases posteriores.
- Usar este checkout aislado; no crear worktrees salvo petición expresa. Preservar trabajo previo del usuario.
