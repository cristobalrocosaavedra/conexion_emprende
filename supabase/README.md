# Supabase

Esquema propuesto en `migrations/` y explicado en [docs/BASE-DE-DATOS.md](../docs/BASE-DE-DATOS.md). Aún no se aplica a ningún proyecto remoto. Claves solo en configuración segura: la clave pública puede ir en la app; `service_role` nunca en el cliente, el repositorio ni el chat. Toda tabla nueva necesita RLS y pruebas de acceso anónimo, propietario, tercero y moderador antes de publicarse.
