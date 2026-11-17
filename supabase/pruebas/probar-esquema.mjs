/* global console, process */
import { PGlite } from "@electric-sql/pglite";
import { postgis } from "@electric-sql/pglite-postgis";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { readFileSync } from "node:fs";

const db = new PGlite({ extensions: { postgis, pg_trgm } });
const sql = readFileSync(process.argv[2], "utf8");
let ok = 0,
  fail = 0;
const check = async (name, fn) => {
  try {
    await fn();
    ok++;
    console.log("ok  ", name);
  } catch (e) {
    fail++;
    console.log("FAIL", name, "-", e.message);
  }
};
const expectError = async (q, params) => {
  try {
    await db.query(q, params);
  } catch {
    return;
  }
  throw new Error("se esperaba error");
};
const as = async (role, uid) => {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${role};`,
  );
};

// Simulación mínima de Supabase.
await db.exec(`
  create schema extensions;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon; create role authenticated; create role service_role bypassrls;
  grant usage on schema public, extensions, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated;
`);
await check("migración aplica", () => db.exec(sql));

const U = {
  owner: "00000000-0000-0000-0000-000000000001",
  otro: "00000000-0000-0000-0000-000000000002",
  mod: "00000000-0000-0000-0000-000000000003",
  muni: "00000000-0000-0000-0000-000000000004",
};
await db.exec(`
  insert into auth.users values ('${U.owner}'),('${U.otro}'),('${U.mod}'),('${U.muni}');
  insert into public.equipo values ('${U.mod}','moderador');
  insert into public.regiones values ('05','Valparaíso',6,null);
  insert into public.provincias values ('054','05','Petorca');
  insert into public.comunas values ('05403','054','05','Papudo','papudo',
    'POINT(-71.45 -32.51)', 'MULTIPOLYGON(((-71.6 -32.6,-71.3 -32.6,-71.3 -32.4,-71.6 -32.4,-71.6 -32.6)))');
  insert into public.categorias values ('alojamiento',null,'Alojamiento',null,null,'cama',true),
    ('alojamiento.hotel','alojamiento','Hotel',null,null,'hotel',true);
  insert into public.fuentes (id,tipo,nombre,url) values
    ('10000000-0000-0000-0000-000000000001','oficial_municipal','Guía municipal','https://ejemplo.cl'),
    ('10000000-0000-0000-0000-000000000002','osm','OpenStreetMap','https://osm.org');
`);

await as("authenticated", U.owner);
let orgId;
await check("dueño crea su negocio y queda propietario", async () => {
  const r = await db.query(
    `insert into public.organizaciones (tipo,nombre,comuna_cut) values ('negocio','Hotel Prueba','05403') returning id`,
  );
  orgId = r.rows[0].id;
  const m = await db.query(
    `select rol from public.miembros where organizacion_id=$1`,
    [orgId],
  );
  if (m.rows[0]?.rol !== "propietario") throw new Error("sin propietario");
});
await check("dueño no puede marcarse fundador", () =>
  expectError(
    `insert into public.organizaciones (tipo,nombre,fundador) values ('negocio','X',true)`,
  ),
);
await check("dueño no puede crear municipio", () =>
  expectError(
    `insert into public.organizaciones (tipo,nombre) values ('municipio','Muni')`,
  ),
);
await check("dueño no inserta fichas directo", () =>
  expectError(
    `insert into public.fichas (slug,comuna_cut,categoria_id,nombre) values ('h','05403','alojamiento.hotel','H')`,
  ),
);
await check("dueño propone cambio por solicitud", () =>
  db.query(
    `insert into public.solicitudes (organizacion_id,datos) values ($1,'{"nombre":"Hotel Prueba"}')`,
    [orgId],
  ),
);
await check("dueño no puede escribir suscripciones", () =>
  expectError(
    `insert into public.suscripciones (organizacion_id,plan_id) values ($1,'completo')`,
    [orgId],
  ),
);

await as("authenticated", U.mod);
let fichaId;
await check("moderación publica ficha con ubicación", async () => {
  const r = await db.query(
    `insert into public.fichas (slug,comuna_cut,organizacion_id,categoria_id,nombre,ubicacion,estado_publicacion)
    values ('hotel-prueba','05403',$1,'alojamiento.hotel','Hotel Prueba','POINT(-71.45 -32.50)','publicado') returning id`,
    [orgId],
  );
  fichaId = r.rows[0].id;
});
await check("no publica sin ubicación ni área", () =>
  expectError(
    `insert into public.fichas (slug,comuna_cut,categoria_id,nombre,estado_publicacion) values ('x','05403','alojamiento.hotel','X','publicado')`,
  ),
);
await check("fuente_oficial sin evidencia oficial falla", () =>
  expectError(
    `update public.fichas set estado_verificacion='fuente_oficial', verificado_en=current_date where id=$1`,
    [fichaId],
  ),
);
await check("fuente_oficial con evidencia oficial pasa", async () => {
  await db.exec("begin");
  await db.query(
    `insert into public.evidencias (ficha_id,fuente_id,consultado_en,campos) values ($1,'10000000-0000-0000-0000-000000000001',current_date,'{nombre}')`,
    [fichaId],
  );
  await db.query(
    `update public.fichas set estado_verificacion='fuente_oficial', verificado_en=current_date, revisar_antes_de=current_date + 365 where id=$1`,
    [fichaId],
  );
  await db.exec("commit");
});

await as("authenticated", U.otro);
await check("tercero no ve la ficha base ni la organización", async () => {
  const f = await db.query(`select * from public.fichas`);
  const o = await db.query(`select * from public.organizaciones`);
  if (f.rows.length || o.rows.length) throw new Error("ve datos ajenos");
});
await check("tercero no puede sumarse como miembro", () =>
  expectError(`insert into public.miembros values ($1,'${U.otro}','editor')`, [
    orgId,
  ]),
);

await as("anon");
await check("anónimo no lee tablas base", () =>
  expectError(`select * from public.fichas`),
);
await check("anónimo ve ficha publicada con fuente", async () => {
  const r = await db.query(
    `select nombre, estado_verificacion, fuentes from public.fichas_publicas`,
  );
  if (
    r.rows.length !== 1 ||
    r.rows[0].estado_verificacion !== "fuente_oficial" ||
    r.rows[0].fuentes.length !== 1
  )
    throw new Error(JSON.stringify(r.rows));
});
await check("cercanía ordena por distancia", async () => {
  const r = await db.query(
    `select distancia_m from public.lugares_cercanos(-32.51, -71.45)`,
  );
  if (
    r.rows.length !== 1 ||
    !(r.rows[0].distancia_m > 1000 && r.rows[0].distancia_m < 1200)
  )
    throw new Error(JSON.stringify(r.rows));
});
await check("comuna por punto", async () => {
  const r = await db.query(
    `select public.comuna_por_punto(-32.5, -71.45) as c`,
  );
  if (r.rows[0].c !== "papudo") throw new Error(r.rows[0].c);
});
await check("espacio comunal base con url canónica", async () => {
  const r = await db.query(
    `select plan, url_canonica from public.espacios_publicos where slug='papudo'`,
  );
  if (r.rows[0].url_canonica !== "https://turismoentumano.cl/papudo")
    throw new Error(JSON.stringify(r.rows));
});
await check("planes públicos con IVA", async () => {
  const r = await db.query(
    `select precio_total_clp from public.planes_publicos where id='presencia'`,
  );
  if (r.rows[0].precio_total_clp !== 11888)
    throw new Error(JSON.stringify(r.rows));
});
await check("interacción suma vista", () =>
  db.query(`select public.registrar_interaccion($1,'vista')`, [fichaId]),
);
await check("anónimo no lee planes base ni suscripciones", async () => {
  await expectError(`select * from public.suscripciones`);
  await expectError(`select * from public.planes`);
});

await as("postgres");
await db.exec(`grant all on all tables in schema public to service_role`);
await as("service_role");
await check("factura exige RUT", () =>
  expectError(
    `insert into public.suscripciones (organizacion_id,plan_id,documento) values ($1,'destacado','factura')`,
    [orgId],
  ),
);
await check("suscripción destacada activa", () =>
  db.query(
    `insert into public.suscripciones (organizacion_id,plan_id,estado,documento,datos_tributarios) values ($1,'destacado','activa','factura','{"rut":"11111111-1"}')`,
    [orgId],
  ),
);
await check("una sola suscripción vigente", () =>
  expectError(
    `insert into public.suscripciones (organizacion_id,plan_id,estado) values ($1,'presencia','activa')`,
    [orgId],
  ),
);
await as("anon");
await check("destacado rotulado visible", async () => {
  const r = await db.query(
    `select destacado_rotulado from public.fichas_publicas`,
  );
  if (r.rows[0].destacado_rotulado !== true) throw new Error("sin rótulo");
});

await as("authenticated", U.owner);
await check("dueño ve su suscripción y sus estadísticas", async () => {
  const s = await db.query(`select * from public.suscripciones`);
  const e = await db.query(`select vistas from public.estadisticas_diarias`);
  if (s.rows.length !== 1 || e.rows[0]?.vistas !== 1)
    throw new Error("no ve lo suyo");
});
await as("authenticated", U.otro);
await check("tercero no ve suscripciones ajenas", async () => {
  const s = await db.query(`select * from public.suscripciones`);
  if (s.rows.length) throw new Error("ve suscripción ajena");
});
await as("postgres");
await check("auditoría registra cambios", async () => {
  const r = await db.query(`select count(*)::int n from public.auditoria`);
  if (!(r.rows[0].n > 3)) throw new Error(String(r.rows[0].n));
});
console.log(`\n${ok} ok, ${fail} fallas`);
process.exit(fail ? 1 : 0);
