-- Turismo en tu Mano — esquema inicial (propuesta 16-11-2026)
-- Plataforma nacional con espacios comunales. RLS en todas las tablas.
-- Reglas: no se guardan coordenadas de visitantes ni datos de tarjeta; lo
-- publicado pasa por moderación; la verificación exige evidencia registrada.

create extension if not exists postgis with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.estado_verificacion as enum (
  'pendiente',       -- sin revisar (OSM, comunidad, importaciones)
  'fuente_oficial',  -- respaldado por fuente oficial con enlace y fecha
  'confirmado',      -- el negocio o el municipio confirmó vigencia
  'desactualizado',  -- venció el plazo de revisión
  'rechazado'
);
create type public.estado_publicacion as enum (
  'borrador', 'en_revision', 'publicado', 'oculto', 'archivado'
);
create type public.tipo_organizacion as enum (
  'negocio', 'agrupacion', 'institucion', 'municipio', 'cadena'
);
create type public.rol_miembro as enum ('propietario', 'editor');
create type public.rol_equipo as enum ('admin', 'moderador');
create type public.tipo_fuente as enum (
  'oficial_municipal', 'oficial_nacional', 'negocio', 'osm', 'comunidad', 'otra'
);
create type public.tipo_documento as enum ('boleta', 'factura');
create type public.estado_suscripcion as enum (
  'prueba', 'activa', 'en_mora', 'pausada', 'cancelada'
);
create type public.ciclo_cobro as enum ('mensual', 'anual');
create type public.estado_solicitud as enum ('pendiente', 'aprobada', 'rechazada');
create type public.plan_comunal as enum ('base', 'promocion_municipal');

-- ---------------------------------------------------------------------------
-- Equipo interno y funciones de permisos
-- ---------------------------------------------------------------------------
create table public.equipo (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_equipo not null,
  creado_en timestamptz not null default now()
);

create function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.equipo
                 where usuario_id = (select auth.uid()) and rol = 'admin');
$$;

create function public.es_moderador() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.equipo where usuario_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------------
-- Territorio (CUT oficial; se carga desde fuente oficial, no se inventa)
-- ---------------------------------------------------------------------------
create table public.regiones (
  cut text primary key,
  nombre text not null,
  orden_norte_sur smallint not null unique,
  limite extensions.geometry(MultiPolygon, 4326)
);

create table public.provincias (
  cut text primary key,
  region_cut text not null references public.regiones (cut),
  nombre text not null
);

create table public.comunas (
  cut text primary key,
  provincia_cut text not null references public.provincias (cut),
  region_cut text not null references public.regiones (cut),
  nombre text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  centro extensions.geography(Point, 4326),
  limite extensions.geometry(MultiPolygon, 4326)
);
create index comunas_region_idx on public.comunas (region_cut);

-- ---------------------------------------------------------------------------
-- Organizaciones: negocios, agrupaciones, instituciones, municipios, cadenas
-- ---------------------------------------------------------------------------
create table public.organizaciones (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_organizacion not null,
  nombre text not null check (length(trim(nombre)) between 2 and 160),
  rut text check (rut ~ '^[0-9]{1,8}-[0-9kK]$'),
  razon_social text,
  formalizada boolean not null default false,
  comuna_cut text references public.comunas (cut),
  padre_id uuid references public.organizaciones (id), -- agrupación o cadena
  fundador boolean not null default false,               -- socios fundadores
  creado_por uuid not null default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check (padre_id is null or padre_id <> id)
);
create unique index organizaciones_rut_idx on public.organizaciones (lower(rut))
  where rut is not null;

create table public.miembros (
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  rol public.rol_miembro not null default 'editor',
  creado_en timestamptz not null default now(),
  primary key (organizacion_id, usuario_id)
);
create index miembros_usuario_idx on public.miembros (usuario_id);

create function public.es_miembro(org uuid, solo_propietario boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.organizacion_id = org and m.usuario_id = (select auth.uid())
      and (not solo_propietario or m.rol = 'propietario'));
$$;

-- ---------------------------------------------------------------------------
-- Espacios comunales: turismoentumano.cl/<slug> y <comuna>entumano.cl
-- Los mismos datos para ambas direcciones; el plan define identidad y dominio.
-- ---------------------------------------------------------------------------
create table public.espacios_comunales (
  comuna_cut text primary key references public.comunas (cut),
  plan public.plan_comunal not null default 'base',
  municipio_id uuid references public.organizaciones (id),
  dominio_propio text unique check (dominio_propio ~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$'),
  identidad jsonb not null default '{}'::jsonb check (jsonb_typeof(identidad) = 'object'),
  convenio_desde date,
  convenio_hasta date,
  publicacion_autorizada boolean not null default false, -- caso municipal visible
  actualizado_en timestamptz not null default now(),
  check (plan = 'base' or municipio_id is not null),
  check (dominio_propio is null or plan = 'promocion_municipal'),
  check (convenio_hasta is null or convenio_desde is null or convenio_hasta >= convenio_desde)
);

create function public.es_editor_municipal(comuna text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.espacios_comunales e
    join public.miembros m on m.organizacion_id = e.municipio_id
    where e.comuna_cut = comuna and m.usuario_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
create table public.categorias (
  id text primary key check (id ~ '^[a-z_]+(\.[a-z_]+)?$'), -- ej. alojamiento.hotel
  padre_id text references public.categorias (id),
  nombre_es text not null,
  nombre_en text,
  nombre_pt text,
  icono text not null,          -- clave del ícono del mapa
  es_parada boolean not null default true -- false para servicios sin visita
);

create table public.fuentes (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_fuente not null,
  nombre text not null,
  url text check (url ~ '^https?://'),
  licencia text,                 -- ej. ODbL 1.0, uso autorizado por convenio
  uso_comercial_permitido boolean, -- null = sin revisar
  condiciones_revisadas_en date,
  notas text
);

create table public.fichas (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  comuna_cut text not null references public.comunas (cut),
  organizacion_id uuid references public.organizaciones (id) on delete set null,
  categoria_id text not null references public.categorias (id),
  nombre text not null check (length(trim(nombre)) between 2 and 160),
  descripcion text check (length(descripcion) <= 2000), -- redacción propia
  direccion text,
  ubicacion extensions.geography(Point, 4326),
  ubicacion_publica boolean not null default true,  -- false: domicilios privados
  area_servicio boolean not null default false,     -- itinerantes / a domicilio
  telefono text,
  whatsapp text check (whatsapp ~ '^\+?[0-9]{8,15}$'),
  correo text,
  sitio_web text check (sitio_web ~ '^https?://'),
  horario jsonb check (horario is null or jsonb_typeof(horario) = 'object'),
  estado_publicacion public.estado_publicacion not null default 'borrador',
  estado_verificacion public.estado_verificacion not null default 'pendiente',
  verificado_en date,
  revisar_antes_de date,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (comuna_cut, slug),
  -- No se publica en el mapa sin ubicación, salvo servicios con área.
  check (estado_publicacion <> 'publicado' or ubicacion is not null or area_servicio),
  check (estado_verificacion not in ('fuente_oficial', 'confirmado') or verificado_en is not null)
);
create index fichas_ubicacion_idx on public.fichas using gist (ubicacion);
create index fichas_comuna_idx on public.fichas (comuna_cut, estado_publicacion);
create index fichas_org_idx on public.fichas (organizacion_id);
create index fichas_nombre_trgm_idx on public.fichas using gin (nombre extensions.gin_trgm_ops);

create table public.evidencias (
  id uuid primary key default gen_random_uuid(),
  ficha_id uuid not null references public.fichas (id) on delete cascade,
  fuente_id uuid not null references public.fuentes (id),
  url text check (url ~ '^https?://'),
  consultado_en date not null,
  campos text[] not null default '{}', -- qué respalda: nombre, telefono, horario…
  revisado_por uuid references auth.users (id),
  notas text,
  creado_en timestamptz not null default now()
);
create index evidencias_ficha_idx on public.evidencias (ficha_id);

-- La verificación exige evidencia: oficial para 'fuente_oficial'.
create function public.validar_verificacion() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.estado_verificacion = 'fuente_oficial' and not exists (
       select 1 from public.evidencias e join public.fuentes f on f.id = e.fuente_id
       where e.ficha_id = new.id and f.tipo in ('oficial_municipal', 'oficial_nacional')) then
    raise exception 'La ficha % necesita evidencia de fuente oficial', new.id;
  end if;
  if new.estado_verificacion = 'confirmado' and not exists (
       select 1 from public.evidencias e where e.ficha_id = new.id) then
    raise exception 'La ficha % necesita evidencia registrada para confirmarse', new.id;
  end if;
  return null;
end $$;
create constraint trigger fichas_verificacion
  after insert or update of estado_verificacion on public.fichas
  deferrable initially deferred
  for each row execute function public.validar_verificacion();

create table public.medios (
  id uuid primary key default gen_random_uuid(),
  ficha_id uuid not null references public.fichas (id) on delete cascade,
  ruta_almacenamiento text not null unique, -- bucket privado hasta aprobar
  estado public.estado_solicitud not null default 'pendiente',
  autor text,
  licencia text,
  autorizacion_titular boolean not null default false,
  orden smallint not null default 0,
  creado_por uuid default auth.uid() references auth.users (id),
  creado_en timestamptz not null default now(),
  check (estado <> 'aprobada' or autorizacion_titular)
);

-- Cambios propuestos por negocios, municipios o comunidad: pasan por moderación.
create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  ficha_id uuid references public.fichas (id) on delete cascade, -- null = ficha nueva
  organizacion_id uuid references public.organizaciones (id) on delete cascade,
  comuna_cut text references public.comunas (cut),
  datos jsonb not null check (jsonb_typeof(datos) = 'object'),
  estado public.estado_solicitud not null default 'pendiente',
  motivo_revision text,
  propuesto_por uuid not null default auth.uid() references auth.users (id),
  revisado_por uuid references auth.users (id),
  creado_en timestamptz not null default now(),
  revisado_en timestamptz
);
create index solicitudes_pendientes_idx on public.solicitudes (creado_en) where estado = 'pendiente';

-- ---------------------------------------------------------------------------
-- Rutas curadas y eventos
-- ---------------------------------------------------------------------------
create table public.rutas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre text not null,
  descripcion text,
  region_cut text not null references public.regiones (cut),
  fuente_id uuid references public.fuentes (id),
  estado_publicacion public.estado_publicacion not null default 'borrador',
  actualizado_en timestamptz not null default now()
);

create table public.paradas_ruta (
  ruta_id uuid not null references public.rutas (id) on delete cascade,
  orden smallint not null check (orden > 0),
  ficha_id uuid not null references public.fichas (id),
  primary key (ruta_id, orden),
  unique (ruta_id, ficha_id)
);

create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  comuna_cut text not null references public.comunas (cut),
  ficha_id uuid references public.fichas (id) on delete set null,
  nombre text not null,
  descripcion text,
  inicio timestamptz not null,
  fin timestamptz,
  fuente_id uuid references public.fuentes (id),
  estado_publicacion public.estado_publicacion not null default 'borrador',
  estado_verificacion public.estado_verificacion not null default 'pendiente',
  check (fin is null or fin >= inicio)
);
create index eventos_comuna_idx on public.eventos (comuna_cut, inicio);

-- ---------------------------------------------------------------------------
-- Planes, promociones y suscripciones (precios netos + IVA; sin datos de tarjeta)
-- ---------------------------------------------------------------------------
create table public.planes (
  id text primary key check (id ~ '^[a-z_]+$'),
  nombre text not null,
  para public.tipo_organizacion[] not null,
  precio_neto_clp integer not null check (precio_neto_clp >= 0),
  iva_porcentaje numeric(4, 2) not null default 19,
  precio_total_clp integer generated always as
    (round(precio_neto_clp * (1 + iva_porcentaje / 100))::integer) stored,
  meses_regalo_anual smallint not null default 2,
  beneficios jsonb not null default '[]'::jsonb,
  destaca boolean not null default false, -- otorga espacio destacado rotulado
  publico boolean not null default true,
  activo boolean not null default true
);

create table public.promociones (
  id text primary key check (id ~ '^[a-z0-9_]+$'),
  descripcion text not null,
  descuento_porcentaje smallint not null check (descuento_porcentaje between 0 and 100),
  meses smallint check (meses > 0), -- null = mientras siga suscrito
  solo_fundadores boolean not null default false,
  vigente_desde date not null,
  vigente_hasta date,
  cupos integer check (cupos > 0)
);

create table public.suscripciones (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references public.organizaciones (id) on delete restrict,
  plan_id text not null references public.planes (id),
  promocion_id text references public.promociones (id),
  estado public.estado_suscripcion not null default 'prueba',
  ciclo public.ciclo_cobro not null default 'mensual',
  documento public.tipo_documento not null default 'boleta',
  -- Datos tributarios para factura (RUT, razón social, giro, dirección).
  datos_tributarios jsonb check (datos_tributarios is null or jsonb_typeof(datos_tributarios) = 'object'),
  proveedor_pago text,              -- referencia externa, nunca datos de tarjeta
  proveedor_suscripcion_id text unique,
  inicio date not null default current_date,
  proximo_cobro date,
  cancelada_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check (documento = 'boleta' or coalesce(datos_tributarios ? 'rut', false))
);
create unique index suscripcion_vigente_idx on public.suscripciones (organizacion_id)
  where estado in ('prueba', 'activa', 'en_mora', 'pausada');

create table public.documentos_tributarios (
  id uuid primary key default gen_random_uuid(),
  suscripcion_id uuid not null references public.suscripciones (id) on delete restrict,
  tipo public.tipo_documento not null,
  folio text,
  monto_neto_clp integer not null check (monto_neto_clp >= 0),
  iva_clp integer not null check (iva_clp >= 0),
  total_clp integer generated always as (monto_neto_clp + iva_clp) stored,
  emitido_en timestamptz not null,
  url_pdf text,
  proveedor_documento_id text unique
);

-- ---------------------------------------------------------------------------
-- Estadísticas agregadas (sin datos de visitantes) y auditoría
-- ---------------------------------------------------------------------------
create table public.estadisticas_diarias (
  ficha_id uuid not null references public.fichas (id) on delete cascade,
  fecha date not null default current_date,
  vistas integer not null default 0,
  contactos integer not null default 0,
  primary key (ficha_id, fecha)
);

create table public.auditoria (
  id bigint generated always as identity primary key,
  tabla text not null,
  fila_id text not null,
  accion text not null,
  usuario_id uuid,
  cambios jsonb,
  en timestamptz not null default now()
);

create function public.auditar() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.auditoria (tabla, fila_id, accion, usuario_id, cambios)
  values (tg_table_name,
          (select coalesce(r ->> 'id', r ->> 'comuna_cut',
                           (r ->> 'organizacion_id') || ':' || (r ->> 'usuario_id'), r ->> 'usuario_id')
             from (select case tg_op when 'DELETE' then to_jsonb(old) else to_jsonb(new) end as r) x),
          tg_op, (select auth.uid()),
          case tg_op when 'DELETE' then to_jsonb(old) else to_jsonb(new) end);
  return coalesce(new, old);
end $$;

create function public.tocar_actualizado() returns trigger
language plpgsql set search_path = '' as $$
begin new.actualizado_en := now(); return new; end $$;

create function public.agregar_propietario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.creado_por is not null then
    insert into public.miembros (organizacion_id, usuario_id, rol)
    values (new.id, new.creado_por, 'propietario') on conflict do nothing;
  end if;
  return new;
end $$;

create trigger organizaciones_propietario after insert on public.organizaciones
  for each row execute function public.agregar_propietario();

do $$
declare t text;
begin
  foreach t in array array['organizaciones', 'espacios_comunales', 'fichas', 'rutas', 'suscripciones'] loop
    execute format('create trigger %I_actualizado before update on public.%I
                    for each row execute function public.tocar_actualizado()', t, t);
  end loop;
  foreach t in array array['espacios_comunales', 'fichas', 'evidencias', 'suscripciones',
                           'miembros', 'equipo', 'planes', 'promociones'] loop
    execute format('create trigger %I_auditoria after insert or update or delete on public.%I
                    for each row execute function public.auditar()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Lectura pública: vistas filtradas (las tablas base no se exponen a anónimos)
-- ---------------------------------------------------------------------------
create view public.fichas_publicas with (security_barrier) as
select f.id, f.slug, f.comuna_cut, c.slug as comuna_slug, c.region_cut,
       f.categoria_id, cat.icono, cat.es_parada, f.nombre, f.descripcion,
       case when f.ubicacion_publica then f.direccion end as direccion,
       case when f.ubicacion_publica then f.ubicacion end as ubicacion,
       f.area_servicio, f.telefono, f.whatsapp, f.correo, f.sitio_web, f.horario,
       case when f.estado_verificacion in ('fuente_oficial', 'confirmado')
                 and f.revisar_antes_de < current_date
            then 'desactualizado'::public.estado_verificacion
            else f.estado_verificacion end as estado_verificacion,
       f.verificado_en,
       exists (select 1 from public.suscripciones s join public.planes p on p.id = s.plan_id
               where s.organizacion_id = f.organizacion_id and s.estado = 'activa'
                 and p.destaca) as destacado_rotulado,
       (select coalesce(jsonb_agg(jsonb_build_object(
                 'fuente', fu.nombre, 'tipo', fu.tipo, 'url', coalesce(e.url, fu.url),
                 'licencia', fu.licencia, 'consultado_en', e.consultado_en)
               order by e.consultado_en desc), '[]'::jsonb)
          from public.evidencias e join public.fuentes fu on fu.id = e.fuente_id
         where e.ficha_id = f.id) as fuentes,
       f.actualizado_en
from public.fichas f
join public.comunas c on c.cut = f.comuna_cut
join public.categorias cat on cat.id = f.categoria_id
where f.estado_publicacion = 'publicado';

create view public.espacios_publicos with (security_barrier) as
select c.cut, c.slug, c.nombre, c.region_cut, c.provincia_cut, c.centro,
       coalesce(e.plan, 'base') as plan,
       case when e.publicacion_autorizada then e.dominio_propio end as dominio_propio,
       case when e.plan = 'promocion_municipal' and e.publicacion_autorizada
            then e.identidad else '{}'::jsonb end as identidad,
       -- Dirección oficial para buscadores: el dominio municipal si existe.
       case when e.publicacion_autorizada and e.dominio_propio is not null
            then 'https://' || e.dominio_propio
            else 'https://turismoentumano.cl/' || c.slug end as url_canonica
from public.comunas c
left join public.espacios_comunales e on e.comuna_cut = c.cut;

create view public.rutas_publicas with (security_barrier) as
select r.id, r.slug, r.nombre, r.descripcion, r.region_cut,
       jsonb_agg(jsonb_build_object('orden', p.orden, 'ficha_id', p.ficha_id)
                 order by p.orden) filter (where fp.id is not null) as paradas
from public.rutas r
left join public.paradas_ruta p on p.ruta_id = r.id
left join public.fichas_publicas fp on fp.id = p.ficha_id
where r.estado_publicacion = 'publicado'
group by r.id;

create view public.planes_publicos with (security_barrier) as
select id, nombre, para, precio_neto_clp, iva_porcentaje, precio_total_clp,
       meses_regalo_anual, beneficios, destaca
from public.planes where publico and activo;

-- Cercanía: llamar por POST (rpc) para que las coordenadas no queden en URLs.
-- La función no guarda nada.
create function public.lugares_cercanos(
  lat double precision, lon double precision,
  radio_m integer default 30000, limite integer default 40, categoria text default null)
returns table (ficha jsonb, distancia_m double precision)
language sql stable set search_path = '' as $$
  select to_jsonb(fp), extensions.st_distance(fp.ubicacion, punto)
  from public.fichas_publicas fp,
       lateral (select extensions.st_setsrid(extensions.st_makepoint(lon, lat), 4326)::extensions.geography as punto) p
  where lat between -90 and 90 and lon between -180 and 180
    and fp.ubicacion is not null
    and extensions.st_dwithin(fp.ubicacion, punto, least(greatest(radio_m, 100), 200000))
    and (categoria is null or fp.categoria_id = categoria or fp.categoria_id like categoria || '.%')
  order by fp.ubicacion operator(extensions.<->) punto
  limit least(greatest(limite, 1), 100);
$$;

create function public.comuna_por_punto(lat double precision, lon double precision)
returns text language sql stable set search_path = '' as $$
  select c.slug from public.comunas c
  where c.limite is not null
    and extensions.st_contains(c.limite, extensions.st_setsrid(extensions.st_makepoint(lon, lat), 4326))
  limit 1;
$$;

create function public.registrar_interaccion(ficha uuid, tipo text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if tipo not in ('vista', 'contacto') then raise exception 'tipo inválido'; end if;
  if not exists (select 1 from public.fichas where id = ficha and estado_publicacion = 'publicado') then
    return;
  end if;
  insert into public.estadisticas_diarias (ficha_id, vistas, contactos)
  values (ficha, (tipo = 'vista')::int, (tipo = 'contacto')::int)
  on conflict (ficha_id, fecha) do update
    set vistas = public.estadisticas_diarias.vistas + excluded.vistas,
        contactos = public.estadisticas_diarias.contactos + excluded.contactos;
end $$;

-- Tarea programada (pg_cron): marca vencidas para revisión.
create function public.marcar_desactualizadas() returns integer
language sql security definer set search_path = '' as $$
  with x as (
    update public.fichas set estado_verificacion = 'desactualizado'
    where estado_verificacion in ('fuente_oficial', 'confirmado')
      and revisar_antes_de < current_date
    returning 1)
  select count(*)::int from x;
$$;

-- ---------------------------------------------------------------------------
-- Privilegios y RLS
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

grant select on public.fichas_publicas, public.espacios_publicos, public.rutas_publicas,
  public.planes_publicos, public.regiones, public.provincias, public.comunas,
  public.categorias, public.eventos to anon, authenticated;
grant execute on function public.lugares_cercanos, public.comuna_por_punto,
  public.registrar_interaccion to anon, authenticated;
grant execute on function public.es_admin, public.es_moderador, public.es_miembro,
  public.es_editor_municipal to authenticated;

grant select, insert, update on public.organizaciones to authenticated;
grant select, insert, delete on public.miembros to authenticated;
grant select on public.fichas, public.evidencias, public.fuentes, public.medios,
  public.suscripciones, public.documentos_tributarios, public.estadisticas_diarias,
  public.espacios_comunales, public.rutas, public.paradas_ruta, public.planes,
  public.promociones to authenticated;
grant insert on public.solicitudes, public.medios to authenticated;
grant select, update on public.solicitudes to authenticated;
grant insert, update, delete on public.fichas, public.evidencias, public.fuentes,
  public.rutas, public.paradas_ruta, public.eventos, public.espacios_comunales,
  public.categorias, public.planes, public.promociones to authenticated; -- limitado por RLS al equipo
grant update, delete on public.medios to authenticated;
grant select on public.auditoria, public.equipo to authenticated;

do $$
declare t text;
begin
  foreach t in array array['equipo', 'regiones', 'provincias', 'comunas', 'organizaciones',
    'miembros', 'espacios_comunales', 'categorias', 'fuentes', 'fichas', 'evidencias', 'medios',
    'solicitudes', 'rutas', 'paradas_ruta', 'eventos', 'planes', 'promociones', 'suscripciones',
    'documentos_tributarios', 'estadisticas_diarias', 'auditoria'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Territorio, categorías y eventos publicados: lectura pública; escritura del equipo.
create policy lectura on public.regiones for select using (true);
create policy lectura on public.provincias for select using (true);
create policy lectura on public.comunas for select using (true);
create policy lectura on public.categorias for select using (true);
create policy equipo on public.categorias for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
create policy lectura on public.eventos for select
  using (estado_publicacion = 'publicado' or (select public.es_moderador())
         or (select public.es_editor_municipal(comuna_cut)));
create policy equipo on public.eventos for all to authenticated
  using ((select public.es_moderador())) with check ((select public.es_moderador()));

-- Equipo y auditoría: solo administración.
create policy lectura on public.equipo for select to authenticated using ((select public.es_admin()));
create policy lectura on public.auditoria for select to authenticated using ((select public.es_admin()));

-- Organizaciones: miembros y equipo.
create policy lectura on public.organizaciones for select to authenticated
  using (creado_por = (select auth.uid()) or (select public.es_miembro(id))
         or (select public.es_moderador()));
create policy crear on public.organizaciones for insert to authenticated
  with check (creado_por = (select auth.uid()) and tipo <> 'municipio' and not fundador);
create policy editar on public.organizaciones for update to authenticated
  using ((select public.es_miembro(id, true)) or (select public.es_admin()))
  with check ((select public.es_admin())
              or (tipo <> 'municipio' and not fundador and padre_id is null));

create policy lectura on public.miembros for select to authenticated
  using (usuario_id = (select auth.uid()) or (select public.es_miembro(organizacion_id, true))
         or (select public.es_admin()));
create policy gestionar on public.miembros for insert to authenticated
  with check (((select public.es_miembro(organizacion_id, true)) and rol = 'editor')
              or (select public.es_admin()));
create policy quitar on public.miembros for delete to authenticated
  using (((select public.es_miembro(organizacion_id, true)) and usuario_id <> (select auth.uid()))
         or (select public.es_admin()));

-- Espacios comunales: lectura del municipio y del equipo; escritura del equipo.
create policy lectura on public.espacios_comunales for select to authenticated
  using ((select public.es_editor_municipal(comuna_cut)) or (select public.es_moderador()));
create policy equipo on public.espacios_comunales for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Fichas: lectura de dueños, municipio y equipo; escritura solo moderación.
create policy lectura on public.fichas for select to authenticated
  using ((organizacion_id is not null and (select public.es_miembro(organizacion_id)))
         or (select public.es_editor_municipal(comuna_cut)) or (select public.es_moderador()));
create policy moderacion on public.fichas for all to authenticated
  using ((select public.es_moderador())) with check ((select public.es_moderador()));

create policy lectura on public.evidencias for select to authenticated
  using ((select public.es_moderador()));
create policy moderacion on public.evidencias for all to authenticated
  using ((select public.es_moderador())) with check ((select public.es_moderador()));
create policy lectura on public.fuentes for select to authenticated using ((select public.es_moderador()));
create policy moderacion on public.fuentes for all to authenticated
  using ((select public.es_moderador())) with check ((select public.es_moderador()));

-- Fotos: suben dueños; aprueba moderación.
create policy lectura on public.medios for select to authenticated
  using ((select public.es_moderador()) or exists (
    select 1 from public.fichas f where f.id = ficha_id and f.organizacion_id is not null
      and (select public.es_miembro(f.organizacion_id))));
create policy subir on public.medios for insert to authenticated
  with check (estado = 'pendiente' and creado_por = (select auth.uid()) and exists (
    select 1 from public.fichas f where f.id = ficha_id and f.organizacion_id is not null
      and (select public.es_miembro(f.organizacion_id))));
create policy moderacion on public.medios for update to authenticated
  using ((select public.es_moderador())) with check ((select public.es_moderador()));
create policy borrar on public.medios for delete to authenticated
  using ((select public.es_moderador()) or (estado = 'pendiente' and creado_por = (select auth.uid())));

-- Solicitudes: cualquiera autenticado propone; dueños solo para su organización.
create policy proponer on public.solicitudes for insert to authenticated
  with check (propuesto_por = (select auth.uid()) and estado = 'pendiente'
              and revisado_por is null
              and (organizacion_id is null or (select public.es_miembro(organizacion_id))
                   or (comuna_cut is not null and (select public.es_editor_municipal(comuna_cut)))));
create policy lectura on public.solicitudes for select to authenticated
  using (propuesto_por = (select auth.uid()) or (select public.es_moderador()));
create policy revisar on public.solicitudes for update to authenticated
  using ((select public.es_moderador())) with check ((select public.es_moderador()));

-- Rutas: equipo.
create policy lectura on public.rutas for select to authenticated using ((select public.es_moderador()));
create policy equipo on public.rutas for all to authenticated
  using ((select public.es_moderador())) with check ((select public.es_moderador()));
create policy lectura on public.paradas_ruta for select to authenticated using ((select public.es_moderador()));
create policy equipo on public.paradas_ruta for all to authenticated
  using ((select public.es_moderador())) with check ((select public.es_moderador()));

-- Planes y promociones: administración.
create policy lectura on public.planes for select to authenticated using ((select public.es_admin()));
create policy equipo on public.planes for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
create policy lectura on public.promociones for select to authenticated using ((select public.es_admin()));
create policy equipo on public.promociones for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Suscripciones y documentos: los ve el propietario; los escribe el servidor
-- (webhooks del proveedor con service_role), nunca el navegador.
create policy lectura on public.suscripciones for select to authenticated
  using ((select public.es_miembro(organizacion_id, true)) or (select public.es_admin()));
create policy lectura on public.documentos_tributarios for select to authenticated
  using ((select public.es_admin()) or exists (
    select 1 from public.suscripciones s where s.id = suscripcion_id
      and (select public.es_miembro(s.organizacion_id, true))));

create policy lectura on public.estadisticas_diarias for select to authenticated
  using ((select public.es_moderador()) or exists (
    select 1 from public.fichas f where f.id = ficha_id and f.organizacion_id is not null
      and (select public.es_miembro(f.organizacion_id))));

-- ---------------------------------------------------------------------------
-- Datos base sin inventar: planes vigentes del material comercial.
-- Promociones y precios de lanzamiento quedan pendientes de decisión.
-- ---------------------------------------------------------------------------
insert into public.planes (id, nombre, para, precio_neto_clp, beneficios, destaca) values
  ('presencia', 'Presencia', '{negocio,cadena,agrupacion}', 9990, '[]', false),
  ('completo', 'Completo', '{negocio,cadena,agrupacion}', 24990, '[]', false),
  ('destacado', 'Destacado', '{negocio,cadena,agrupacion}', 39990, '[]', true);
