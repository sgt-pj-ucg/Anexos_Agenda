-- Esquema del Directorio Judicial · La Serena
-- Ejecutar una sola vez en Supabase (SQL Editor).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------
create table if not exists personas (
  id text primary key,
  nombre text not null,
  cargo text,
  unidad text not null,
  seccion text not null,
  tribunal text,
  correos text[] not null default '{}',
  anexo text,
  cumpleanos text,
  grado text,
  calidad_juridica text,
  es_generico boolean not null default false,
  vacante boolean not null default false,
  suplente text,
  comuna text,
  -- Vigencia de cargos transitorios (reemplazo, suplencia, interinato): si
  -- "vigencia_hasta" ya pasó, la tarjeta se marca en naranjo como alerta.
  vigencia_desde date,
  vigencia_hasta date,
  orden integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Los contactos existentes traen su posición original (orden 0..N) desde la
-- carga inicial; los que agregue un administrador después reciben un
-- número más alto automáticamente, para que se sumen al final de su
-- sección sin desordenar los ya existentes.
create sequence if not exists personas_orden_seq start 100000;

create table if not exists tribunales (
  id text primary key,
  nombre text not null,
  correo text,
  telefono text,
  telefonos text[] not null default '{}',
  direccion text,
  ministro_visitador text,
  competencias text[] not null default '{}',
  comuna text,
  -- correo genérico ("correo") es fijo desde la carga inicial; estos dos
  -- son actualizables por el administrador desde la ficha del tribunal.
  correo_admin_secretario text,
  correo_segundo_lider text,
  updated_at timestamptz not null default now()
);

-- Guarda solo el hash SHA-256 de la clave de administrador; nunca la clave
-- en texto plano.
create table if not exists app_config (
  key text primary key,
  value text not null
);
insert into app_config (key, value)
values ('admin_password_hash', 'bbc0da8fc88d3442496a2f02e2769ea11cf7300c6b816f3071cbe8862582ef7b')
on conflict (key) do nothing;

-- Lista de administradores: cada uno entra con su propio RUT + clave (ver
-- función verify_admin_login más abajo). Reemplaza la clave única de
-- app_config de arriba, que ya no se usa para validar escrituras.
create table if not exists admins (
  rut text primary key,
  nombre text not null,
  password_hash text not null
);

-- Registro de cambios para el panel de "novedades": cada función de
-- escritura agrega una fila aquí después de aplicar el cambio.
create table if not exists cambios (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tipo text not null,
  entidad text not null,
  detalle text,
  -- Nombre del administrador que hizo el cambio (trazabilidad).
  admin_nombre text
);

-- Avisos de "dato incorrecto" que cualquier usuario puede crear; solo el
-- administrador puede marcarlos como resueltos (o reabrirlos).
create table if not exists reportes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  entidad text not null,
  contexto text,
  descripcion text not null,
  estado text not null default 'pendiente',
  resolved_at timestamptz
);

-- Directorio de referencia de contactos externos: Academia Judicial, CBR y
-- Notarías, Cortes del país, Receptores/Procuradores del Número y Juzgados
-- de Policía Local.
create table if not exists contactos_externos (
  id text primary key,
  categoria text not null,
  institucion text,
  nombre text,
  cargo text,
  comuna text,
  correos text[] not null default '{}',
  telefonos text[] not null default '{}',
  direccion text,
  calidad_juridica text,
  observaciones text,
  vigencia_desde date,
  vigencia_hasta date,
  orden integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Igual que "personas": los contactos cargados desde la planilla traen su
-- orden original por categoría; los agregados después reciben un número
-- más alto automáticamente.
create sequence if not exists contactos_externos_orden_seq start 100000;

-- ---------------------------------------------------------------------
-- Seguridad: lectura pública, escritura solo vía funciones con clave
-- ---------------------------------------------------------------------
alter table personas enable row level security;
alter table tribunales enable row level security;
alter table app_config enable row level security;
alter table cambios enable row level security;
alter table reportes enable row level security;
alter table contactos_externos enable row level security;
alter table admins enable row level security;

drop policy if exists "lectura publica personas" on personas;
create policy "lectura publica personas" on personas for select using (true);

drop policy if exists "lectura publica tribunales" on tribunales;
create policy "lectura publica tribunales" on tribunales for select using (true);

drop policy if exists "lectura publica cambios" on cambios;
create policy "lectura publica cambios" on cambios for select using (true);

drop policy if exists "lectura publica reportes" on reportes;
create policy "lectura publica reportes" on reportes for select using (true);

drop policy if exists "lectura publica contactos_externos" on contactos_externos;
create policy "lectura publica contactos_externos" on contactos_externos for select using (true);

-- Cualquier usuario puede crear un reporte (no requiere clave de
-- administrador), pero siempre en estado "pendiente"; solo la función
-- admin_set_reporte_estado (que sí valida la clave) puede resolverlo.
drop policy if exists "crear reporte publico" on reportes;
create policy "crear reporte publico" on reportes for insert
  with check (estado = 'pendiente' and resolved_at is null);

-- app_config no tiene políticas -> RLS deniega todo acceso directo
-- (ni siquiera lectura), solo accesible desde las funciones SECURITY DEFINER.

revoke insert, update, delete on personas from anon, authenticated;
revoke insert, update, delete on tribunales from anon, authenticated;
revoke insert, update, delete on cambios from anon, authenticated;
revoke update, delete on reportes from anon, authenticated;
revoke insert, update, delete on contactos_externos from anon, authenticated;
-- admins no tiene políticas -> RLS deniega todo acceso directo (ni
-- siquiera lectura), solo accesible desde las funciones SECURITY DEFINER.
revoke all on admins from anon, authenticated;

-- ---------------------------------------------------------------------
-- Funciones de escritura (verifican la clave de administrador)
-- ---------------------------------------------------------------------
-- Valida contra la lista de administradores (tabla "admins"): cualquiera
-- de sus claves individuales habilita la escritura.
create or replace function verify_admin(admin_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return exists (
    select 1 from admins where password_hash = encode(digest(admin_password, 'sha256'), 'hex')
  );
end;
$$;

-- Busca el nombre del administrador dueño de esta clave (asume claves
-- únicas por administrador, que es como se cargaron más abajo).
create or replace function admin_nombre(admin_password text)
returns text
language sql
security definer
set search_path = public, extensions
as $$
  select nombre from admins where password_hash = encode(digest(admin_password, 'sha256'), 'hex') limit 1;
$$;

-- Verifica RUT + clave para el login (pantalla "Acceso administrador").
-- Devuelve el nombre del administrador (para mostrarlo en el encabezado) o
-- null si el RUT/clave no son correctos.
create or replace function verify_admin_login(admin_rut text, admin_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  encontrado record;
begin
  select rut, nombre, password_hash into encontrado from admins where rut = admin_rut;
  if encontrado.rut is null then
    return null;
  end if;
  if encode(digest(admin_password, 'sha256'), 'hex') = encontrado.password_hash then
    return encontrado.nombre;
  end if;
  return null;
end;
$$;

create or replace function admin_upsert_persona(admin_password text, p jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ya_existia boolean;
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

  select exists(select 1 from personas where id = p->>'id') into ya_existia;

  insert into personas (
    id, nombre, cargo, unidad, seccion, tribunal, correos, anexo, cumpleanos,
    grado, calidad_juridica, es_generico, vacante, suplente, comuna,
    vigencia_desde, vigencia_hasta, orden, updated_at
  )
  values (
    p->>'id', p->>'nombre', p->>'cargo', p->>'unidad', p->>'seccion', p->>'tribunal',
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'correos', '[]'::jsonb)) x), '{}'),
    p->>'anexo', p->>'cumpleanos', p->>'grado', p->>'calidadJuridica',
    coalesce((p->>'esGenerico')::boolean, false),
    coalesce((p->>'vacante')::boolean, false),
    p->>'suplente', p->>'comuna',
    nullif(p->>'vigenciaDesde', '')::date, nullif(p->>'vigenciaHasta', '')::date,
    coalesce((p->>'orden')::int, nextval('personas_orden_seq')),
    now()
  )
  on conflict (id) do update set
    nombre = excluded.nombre,
    cargo = excluded.cargo,
    unidad = excluded.unidad,
    seccion = excluded.seccion,
    tribunal = excluded.tribunal,
    correos = excluded.correos,
    anexo = excluded.anexo,
    cumpleanos = excluded.cumpleanos,
    grado = excluded.grado,
    calidad_juridica = excluded.calidad_juridica,
    es_generico = excluded.es_generico,
    vacante = excluded.vacante,
    suplente = excluded.suplente,
    comuna = excluded.comuna,
    vigencia_desde = excluded.vigencia_desde,
    vigencia_hasta = excluded.vigencia_hasta,
    updated_at = now();
    -- orden no se actualiza: un contacto editado mantiene su posición.

  insert into cambios (tipo, entidad, detalle, admin_nombre)
  values (
    case when ya_existia then 'persona_editada' else 'persona_agregada' end,
    p->>'nombre',
    p->>'unidad',
    admin_nombre(admin_password)
  );
end;
$$;

create or replace function admin_delete_persona(admin_password text, persona_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  nombre_persona text;
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

  select nombre into nombre_persona from personas where id = persona_id;

  delete from personas where id = persona_id;

  if nombre_persona is not null then
    insert into cambios (tipo, entidad, detalle, admin_nombre)
    values ('persona_eliminada', nombre_persona, null, admin_nombre(admin_password));
  end if;
end;
$$;

create or replace function admin_update_ficha(admin_password text, ficha_id text, patch jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  nombre_tribunal text;
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

  select nombre into nombre_tribunal from tribunales where id = ficha_id;

  update tribunales set
    ministro_visitador = patch->>'ministroVisitador',
    correo = patch->>'correo',
    telefonos = coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(patch->'telefonos', '[]'::jsonb)) x), '{}'),
    direccion = patch->>'direccion',
    competencias = coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(patch->'competencias', '[]'::jsonb)) x), '{}'),
    correo_admin_secretario = patch->>'correoAdminSecretario',
    correo_segundo_lider = patch->>'correoSegundoLider',
    updated_at = now()
  where id = ficha_id;

  insert into cambios (tipo, entidad, detalle, admin_nombre)
  values ('ficha_editada', coalesce(nombre_tribunal, ficha_id), null, admin_nombre(admin_password));
end;
$$;

create or replace function admin_set_reporte_estado(admin_password text, reporte_id bigint, nuevo_estado text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

  update reportes set
    estado = nuevo_estado,
    resolved_at = case when nuevo_estado = 'resuelto' then now() else null end
  where id = reporte_id;
end;
$$;

-- Actualiza el contacto si el id ya existe, o lo crea si no (alta desde la
-- sección "Externo").
create or replace function admin_update_contacto_externo(admin_password text, contacto_id text, patch jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ya_existia boolean;
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

  select exists(select 1 from contactos_externos where id = contacto_id) into ya_existia;

  insert into contactos_externos (
    id, categoria, institucion, nombre, cargo, comuna, correos, telefonos,
    direccion, calidad_juridica, observaciones, vigencia_desde, vigencia_hasta,
    orden, updated_at
  )
  values (
    contacto_id, patch->>'categoria', patch->>'institucion', patch->>'nombre', patch->>'cargo', patch->>'comuna',
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(patch->'correos', '[]'::jsonb)) x), '{}'),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(patch->'telefonos', '[]'::jsonb)) x), '{}'),
    patch->>'direccion', patch->>'calidadJuridica', patch->>'observaciones',
    nullif(patch->>'vigenciaDesde', '')::date, nullif(patch->>'vigenciaHasta', '')::date,
    nextval('contactos_externos_orden_seq'),
    now()
  )
  on conflict (id) do update set
    categoria = excluded.categoria,
    institucion = excluded.institucion,
    nombre = excluded.nombre,
    cargo = excluded.cargo,
    comuna = excluded.comuna,
    correos = excluded.correos,
    telefonos = excluded.telefonos,
    direccion = excluded.direccion,
    calidad_juridica = excluded.calidad_juridica,
    observaciones = excluded.observaciones,
    vigencia_desde = excluded.vigencia_desde,
    vigencia_hasta = excluded.vigencia_hasta,
    updated_at = now();

  insert into cambios (tipo, entidad, detalle, admin_nombre)
  values (
    case when ya_existia then 'contacto_externo_editado' else 'contacto_externo_agregado' end,
    coalesce(patch->>'nombre', patch->>'institucion', contacto_id),
    null,
    admin_nombre(admin_password)
  );
end;
$$;

create or replace function admin_delete_contacto_externo(admin_password text, contacto_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  nombre_contacto text;
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

  select nombre into nombre_contacto from contactos_externos where id = contacto_id;

  delete from contactos_externos where id = contacto_id;

  if nombre_contacto is not null then
    insert into cambios (tipo, entidad, detalle, admin_nombre)
    values ('contacto_externo_eliminado', nombre_contacto, null, admin_nombre(admin_password));
  end if;
end;
$$;

grant execute on function admin_upsert_persona(text, jsonb) to anon, authenticated;
grant execute on function admin_delete_persona(text, text) to anon, authenticated;
grant execute on function admin_update_ficha(text, text, jsonb) to anon, authenticated;
grant execute on function admin_set_reporte_estado(text, bigint, text) to anon, authenticated;
grant execute on function admin_update_contacto_externo(text, text, jsonb) to anon, authenticated;
grant execute on function admin_delete_contacto_externo(text, text) to anon, authenticated;
grant execute on function verify_admin_login(text, text) to anon, authenticated;
grant execute on function admin_nombre(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Administradores: cada uno con su propio RUT y clave (hash SHA-256, nunca
-- en texto plano). Ver supabase/migration_011_admins_por_rut.sql para el
-- detalle de cómo se generaron estos hashes.
-- ---------------------------------------------------------------------
insert into admins (rut, nombre, password_hash) values
('9944272-7', 'Miriam Ruth Véliz Cortés', 'dea6b75cb2065d381d5231209b4c2833db500a3497934a449c3994c523535bae'),
('13651825-9', 'Magaly Isabel Retamales Venegas', '87af510922268c1ef06ecabc0005699d695d03e3c02d65aceb06e9aa55fd5475'),
('10117477-8', 'Sandra Del Carmen Jauriat Moya', '93f426cb88384c2b2f9f5095f5a9d5a8fcba4b79f14437bced3d68a683156ac6'),
('16109447-1', 'Viviana Noemí Carvajal Carvajal', '7c67374f8e5c02aababb0b7414a08b78b790a866300d97912d4034155892158f'),
('12444689-9', 'Chrysley Rudecinda Santander Alfaro', 'f60328cfec776e3fd5aa18f419eeaab2aa60febf495f1adc7054b1056092988d'),
('13761912-1', 'Carolina De Los Angeles Marchant Rojas', 'fcc8d5756135d5f79cc4a8ae29929fb3187ec4d18f8daeef071c14d47debeb17'),
('18028789-2', 'Gianina Gigliola María Rojas Olivier', 'ecd84be9d4b2e5d40bdcd0e92e36c9f5b5b5ab194ae7c60e45a16258e755a9be'),
('12570532-4', 'Andrea Gabriela Mauad Julio', 'e32b78aec168df7c8b30f06ff9899963ddeb6197f7432d48c9b846845a7beb37'),
('9451502-5', 'Héctor Iván Martínez Juica', 'ff8995c11435fc613d6a355b73f94b0ae71336dfeaecf04d9d7cdde04da07da9'),
('14379056-8', 'Naldo Domerico Vicencio Tapia', '06a6c9f0501837a05b31ea968003591d41f59e7a939aa3deb93d57357316c555'),
('17113679-2', 'Sonia Alejandra Caimanque Araya', 'da94828dc67918a4ddef838754240cdd52c54930061f608232570a76c60a1fce'),
('15870852-3', 'Juan Carlos Olave Soto', '36bd54becb6e27e1127af84e25f7d35d4cb3b5e39c29d27bc521e7f236190188'),
('18062446-5', 'Camila De Jesús Ortiz Valdivia', '8f74572ce0913fe0d89aebd64e4dcd69e44ae1394469d8745fc357d9d916d56d'),
('18179901-3', 'Axeline Yeritza Aguilera Alcayaga', '113dc08b4eca6447ecd4d9b2af06e589313db04d16591d4a99d518a4f267b1f9'),
('9693215-4', 'Hugo Alexis Contreras Puyo', 'c538292f976a9b85742fab67ca22f7503dd66bdda189bb1e890c123ae01de62a'),
('10186440-5', 'Ricardo Antonio Pizarro González', '832e6bdcb77e962c950071fd29a6d5b5349d55158c61420facd59ae54f2bb016'),
('11961346-9', 'Scarlett Marcela Berríos Molina', 'e500c1ecbb6971bcf884e1887967a4af4cb392e8dbc2bb0fa71eed4536cf2fee'),
('19154833-7', 'Lía Victoria Flores Velásquez', '62b51050238f5edfbe9713cfe96b8a1604d4faf4328186559071b2c051ccdcde'),
('19041529-5', 'Camila Michel Tapia Pastén', 'd94e8e30ae0c793971c4966c472fa3f2f10b24e76a1dda2b518caec68123df5f'),
('19758764-4', 'Gustavo Eduardo Talcado Vidal', '7f8ae98dfa26c5ebe7c6d109997b3899956d43008cf59d3fdfd5e3c178ddd054')
on conflict (rut) do update set
  nombre = excluded.nombre,
  password_hash = excluded.password_hash;

-- ---------------------------------------------------------------------
-- Tiempo real: para que los cambios se vean al instante en todas las
-- pantallas abiertas, sin necesidad de recargar la página.
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table personas;
alter publication supabase_realtime add table tribunales;
alter publication supabase_realtime add table cambios;
alter publication supabase_realtime add table reportes;
alter publication supabase_realtime add table contactos_externos;
