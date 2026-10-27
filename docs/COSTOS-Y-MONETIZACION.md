# Territorio Vivo — presupuesto y freemium

24-10-2026. Propuesta para decidir, no tarifas de proveedores verificadas ni precios aprobados. No se implementan cobros en la maqueta. El usuario solicita presupuestar mantenimiento y definir cómo ofrecer participación gratuita y exposición pagada en el futuro.

## Qué pagamos y cuándo

| Partida                      | Maqueta APK                                        | Piloto con datos reales                                     | Escala nacional                                               |
| ---------------------------- | -------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| GitHub Actions y artefactos  | Medir minutos de validación/build y almacenamiento | Límites y concurrencia según plan y visibilidad del repo    | Revisar cuota y evitar compilar por cambios solo documentales |
| Apple                        | Exportar JS iOS no exige publicar en App Store     | Cuenta Apple Developer y firma si se distribuye a iPhone    | Renovación y reglas vigentes de tienda                        |
| Google Play                  | No se necesita para descargar APK desde Actions    | Registro y requisitos si se publica en Play                 | Políticas, revisión y mantenimiento de versiones              |
| Base, autenticación y copias | Sin backend en esta entrega                        | Supabase o equivalente, copias y prueba de recuperación     | Conexiones, almacenamiento, CPU/IO y backups                  |
| Imágenes y CDN               | Recursos locales pequeños                          | Fotos aprobadas, miniaturas, egreso y retención             | Probablemente una de las partidas variables principales       |
| Mapas                        | Selector SVG local; sin proveedor operativo        | Estilos, teselas y atribución si se incorporan mapas reales | Distribución de mapas y descargas regionales                  |
| Rutas                        | No hay motor real                                  | Servidor/proveedor al autorizar rutas                       | CPU, RAM, actualizaciones OSM, redundancia y egreso           |
| Correo y SMS                 | Sin cuentas                                        | Correo transaccional; SMS solo si se elige                  | Pago por volumen y prevención de abuso                        |
| Moderación y soporte         | Ejemplos sin altas públicas                        | Revisión humana, reportes y contacto con negocios           | Personal, horarios de cobertura y herramientas                |
| Operación y cumplimiento     | Documentación y desarrollo                         | Privacidad, términos, revisión legal y contable             | Incidentes, auditorías, solicitudes y actualización legal     |

No asumir que GitHub Actions es ilimitado o gratuito sin comprobar plan y visibilidad del repositorio. No asumir que un plan gratuito de base sirve indefinidamente para producción. Revisar tarifas oficiales al contratar; registrar proveedor, moneda, fecha, límites, excedentes y condiciones. No contratar ningún servicio por esta propuesta.

## Modelo de costos que podemos medir

Costo mensual = costos fijos + uso variable + horas de operación × valor/hora + impuestos/cambio aplicables + reserva de contingencia.

- Almacenamiento de fotos (GB) ≈ negocios × fotos promedio × MB por foto / 1000, más originales retenidos, miniaturas y copias. No calcular solo las fotos publicadas si la cuarentena también ocupa espacio.
- Egreso de imágenes (GB/mes) ≈ tarjetas realmente vistas × MB descargados por tarjeta / 1000, ajustado por caché. No multiplicar por todos los inscritos si no se descargan todos.
- Builds Android (min/mes) ≈ número de builds × duración medida. Cancelar trabajos obsoletos, reutilizar cachés y reducir arquitecturas para pruebas.
- Moderación (h/mes) ≈ altas y revisiones × minutos por revisión / 60, más reportes y apelaciones. La asistencia automática no elimina revisión humana.
- Margen por plan = ingreso sin impuestos − comisión de cobro − infraestructura incremental − soporte incremental. No confundir facturación con dinero disponible.

Ejemplo puramente de dimensionamiento, no pronóstico: 500 fichas con 5 imágenes de 0,2 MB ocupan alrededor de 0,5 GB de imágenes publicadas. 100.000 descargas de tarjetas con 0,15 MB de imagen transfieren alrededor de 15 GB. Si hay 300 revisiones mensuales de 4 minutos son 20 horas, sin incluir reportes. Los tamaños y tasas deben sustituirse por mediciones reales.

## Presupuestos de trabajo en pesos chilenos

Estos son **techos internos orientativos para decidir**, no cotizaciones de mercado, compromisos de gasto ni garantías de que la infraestructura quepa en ellos. Se revisan al tener tráfico medido y precios vigentes. Excluyen desarrollo inicial, equipos, honorarios legales/contables, impuestos, cuentas de tiendas y motor nacional de rutas.

| Escenario hipotético                              | Reserva mensual de infraestructura        | Operación humana supuesta                          | Reserva total ilustrativa                            |
| ------------------------------------------------- | ----------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| Maqueta sin público real                          | CLP 0–30.000 de margen para CI/artefactos | Trabajo de diseño/desarrollo se presupuesta aparte | CLP 0–30.000, sin afirmar que el costo real sea cero |
| Piloto: 500 oferentes, 5.000 sesiones/mes         | CLP 50.000–150.000                        | 20 h × CLP 8.000/h = CLP 160.000                   | Con 20% de reserva: CLP 252.000–372.000              |
| Crecimiento: 5.000 oferentes, 50.000 sesiones/mes | CLP 150.000–500.000                       | 80 h × CLP 8.000/h = CLP 640.000                   | Con 20% de reserva: CLP 948.000–1.368.000            |

CLP 8.000/h es un supuesto aritmético de planificación, no sueldo de mercado ni costo laboral completo. Las horas no se deducen automáticamente del número de inscritos: deben medirse altas, cambios y reportes. Si se incorpora ruteo, descarga offline o alta frecuencia de fotos, rehacer el presupuesto antes de habilitarlos. Sin tráfico definido no corresponde prometer una capacidad nacional por estos montos.

Antes de abrir un piloto fijar un máximo mensual autorizado y alertas al 50/80/100%. Al exceder el presupuesto, revisar descargas, retención y ampliación con el titular; no cobrar ni cortar fichas gratuitamente sin aviso. Priorizar compresión, caché, cuotas y revisión de consultas antes de contratar más servidores.

## Propuesta freemium para oferentes

La ficha básica sigue siendo útil y gratuita. No cobrar por verificación básica ni vender el estado «verificado». El pago compra herramientas y exposición adicional identificada, no una recomendación editorial encubierta ni una garantía de clientes.

| Plan de trabajo | Beneficio propuesto                                                                                                       | Límite a acordar                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Gratis          | Perfil, contacto público autorizado, ubicación/área de servicio, fotos básicas, aparición en búsqueda y rotación orgánica | Número de fichas y fotos, renovación de datos y prevención de duplicados |
| Impulso         | Todo lo gratuito, cupos destacados rotulados, más fotos y estadísticas agregadas útiles                                   | Territorio, frecuencia máxima y disponibilidad de cupos                  |
| Gestión         | Más herramientas para varios locales, gestión de ofertas y análisis agregado                                              | Número de locales, soporte y límites por abuso                           |
| Campaña         | Exposición temporal para un evento o temporada, identificada como patrocinada                                             | Fechas, presupuesto, inventario disponible y métricas de entrega         |

Precios para validar en entrevistas, **no aprobados ni publicados**: Impulso a CLP 4.900/mes y Gestión a CLP 12.900/mes. Evaluar si son precios finales o netos, impuestos, costos de soporte y disposición a pagar antes de vender. No generar enlaces de cobro, pruebas con renovación automática ni contratos en esta etapa.

No priorizar premium para viajeros en el inicio: primero demostrar descubrimiento útil y participación de negocios. No cerrar la exploración básica, el consentimiento ni los controles de seguridad detrás de un pago. Descargas offline u otras funciones costosas podrían evaluarse después, sin dar por elegida esa monetización.

## Equidad y medición de exposición

- Rotación orgánica con oportunidades para inscritos elegibles; no prometer una visualización diaria real si no hay suficientes visitantes.
- Espacios patrocinados separados e identificados. Propuesta a probar: máximo 20% de las tarjetas de un bloque; proporción pendiente de aprobación y de diseño.
- Cercanía, vigencia y elegibilidad siguen aplicando a todos. Un pago no hace visitable una dirección privada ni incorpora un negocio en una ruta imposible.
- «Impresión» necesita una tarjeta visible durante un umbral definido, no solo descargada. El paso rápido por regiones intermedias no cuenta como exposición vendida.
- Estadísticas agregadas sin coordenadas del viajero ni perfiles personales de seguimiento. Distinguir vistas, contactos y visitas reales; un toque en WhatsApp no prueba una venta.
- No vender más cupos de los que pueden entregarse. Condiciones explícitas para pausas, cancelación, no renovación y compensación si falla una campaña.

## Punto de equilibrio ilustrativo

Para un gasto operativo supuesto de CLP 300.000/mes y un margen disponible supuesto del 75% del precio cobrado:

- A CLP 4.900 por suscripción: 300.000 / (4.900 × 0,75) → **82 suscripciones pagadas**.
- A CLP 12.900 por suscripción: 300.000 / (12.900 × 0,75) → **32 suscripciones pagadas**.

No son una proyección de ventas. El 75% es un supuesto simplificado; reemplazarlo por margen real después de impuestos, comisiones, cancelaciones y costos marginales. También falta remunerar desarrollo inicial si se busca recuperar esa inversión. Con 500 oferentes y 5% de conversión solo hay 25 pagadores: no basta para el primer ejemplo. No ocultar esa diferencia bajo una expectativa de viralidad.

## Cobros en Android e iOS

Antes de activar pagos, revisar reglas vigentes de ambas tiendas. Vender destacados, suscripciones o herramientas digitales dentro de la app puede requerir sus sistemas de compra y comisiones; cobrar por un servicio físico turístico es un caso diferente. No asumir que cobrar por web permite eludir esas reglas ni añadir enlaces externos sin revisión. Estos costos pueden cambiar el margen y el precio; no están resueltos por elegir React Native.

## Próximas decisiones de negocio

Después de probar la APK: fijar presupuesto máximo del piloto; medir moderación y tráfico; entrevistar oferentes sobre Impulso; comprobar tarifas de infraestructura y reglas de tiendas; aprobar precios, impuestos y entrega de exposición. Llevar esas decisiones de una en una con el usuario. El nombre de los planes y los valores anteriores son hipótesis, no funciones autorizadas para implementar ahora.

## Primera medición de CI

La ejecución 40117286924, del 24-10-2026, consumió 1m10s de validación y 14m26s
para el job Android, y produjo un artefacto de 33.706.587 bytes. Es una medición
de esta primera compilación, no una tarifa ni una promesa de duración futura.
El costo facturable depende del plan, cuotas y reglas de GitHub. La concurrencia
por rama evita mantener el push y PR del mismo cambio compilando a la vez.

## Decisión posterior: VPS separado para rutas

El titular elige un motor propio sin logs de ubicación. La preparación 0.4 está en [SERVIDOR-DE-RUTAS.md](SERVIDOR-DE-RUTAS.md): propuesta inicial 4 vCPU / 16 GB RAM / 160 GB SSD; reservar US$25–60/mes más US$5–15 de contingencia, impuestos y excedentes. Es una estimación para comparar proveedores, no precio verificado ni gasto aprobado. Medir el grafo nacional y carga real antes de comprometer capacidad o plazo. No vincular la compra a una suscripción de oferentes todavía.

## Presupuesto vigente: US$0 durante las pruebas (25-10-2026)

El titular aclara que no desea gastar ahora. Autoriza usar FOSSGIS/OSRM temporalmente para probar ruteo dentro de la app. No se contratan VPS ni servicios facturables. Los montos anteriores son escenarios futuros, no gastos aprobados. El servicio público es compartido, registra consultas y tiene condiciones/límites; no se vende su acceso ni se usa como compromiso de capacidad de una app comercial. Ver RUTEO-PUBLICO-DE-PRUEBAS.md.
