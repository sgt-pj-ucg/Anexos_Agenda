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
  ministro_visitador text,
  competencias text[] not null default '{}',
  comuna text,
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

-- Registro de cambios para el panel de "novedades": cada función de
-- escritura agrega una fila aquí después de aplicar el cambio.
create table if not exists cambios (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tipo text not null,
  entidad text not null,
  detalle text
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

-- ---------------------------------------------------------------------
-- Seguridad: lectura pública, escritura solo vía funciones con clave
-- ---------------------------------------------------------------------
alter table personas enable row level security;
alter table tribunales enable row level security;
alter table app_config enable row level security;
alter table cambios enable row level security;
alter table reportes enable row level security;

drop policy if exists "lectura publica personas" on personas;
create policy "lectura publica personas" on personas for select using (true);

drop policy if exists "lectura publica tribunales" on tribunales;
create policy "lectura publica tribunales" on tribunales for select using (true);

drop policy if exists "lectura publica cambios" on cambios;
create policy "lectura publica cambios" on cambios for select using (true);

drop policy if exists "lectura publica reportes" on reportes;
create policy "lectura publica reportes" on reportes for select using (true);

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

-- ---------------------------------------------------------------------
-- Funciones de escritura (verifican la clave de administrador)
-- ---------------------------------------------------------------------
create or replace function verify_admin(admin_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored text;
begin
  select value into stored from app_config where key = 'admin_password_hash';
  return stored is not null and encode(digest(admin_password, 'sha256'), 'hex') = stored;
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
    grado, calidad_juridica, es_generico, vacante, suplente, comuna, orden, updated_at
  )
  values (
    p->>'id', p->>'nombre', p->>'cargo', p->>'unidad', p->>'seccion', p->>'tribunal',
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'correos', '[]'::jsonb)) x), '{}'),
    p->>'anexo', p->>'cumpleanos', p->>'grado', p->>'calidadJuridica',
    coalesce((p->>'esGenerico')::boolean, false),
    coalesce((p->>'vacante')::boolean, false),
    p->>'suplente', p->>'comuna',
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
    updated_at = now();
    -- orden no se actualiza: un contacto editado mantiene su posición.

  insert into cambios (tipo, entidad, detalle)
  values (
    case when ya_existia then 'persona_editada' else 'persona_agregada' end,
    p->>'nombre',
    p->>'unidad'
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
    insert into cambios (tipo, entidad, detalle) values ('persona_eliminada', nombre_persona, null);
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
    telefono = patch->>'telefono',
    competencias = coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(patch->'competencias', '[]'::jsonb)) x), '{}'),
    updated_at = now()
  where id = ficha_id;

  insert into cambios (tipo, entidad, detalle)
  values ('ficha_editada', coalesce(nombre_tribunal, ficha_id), null);
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

grant execute on function admin_upsert_persona(text, jsonb) to anon, authenticated;
grant execute on function admin_delete_persona(text, text) to anon, authenticated;
grant execute on function admin_update_ficha(text, text, jsonb) to anon, authenticated;
grant execute on function admin_set_reporte_estado(text, bigint, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Tiempo real: para que los cambios se vean al instante en todas las
-- pantallas abiertas, sin necesidad de recargar la página.
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table personas;
alter publication supabase_realtime add table tribunales;
alter publication supabase_realtime add table cambios;
alter publication supabase_realtime add table reportes;
