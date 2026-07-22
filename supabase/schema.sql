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

-- ---------------------------------------------------------------------
-- Seguridad: lectura pública, escritura solo vía funciones con clave
-- ---------------------------------------------------------------------
alter table personas enable row level security;
alter table tribunales enable row level security;
alter table app_config enable row level security;

drop policy if exists "lectura publica personas" on personas;
create policy "lectura publica personas" on personas for select using (true);

drop policy if exists "lectura publica tribunales" on tribunales;
create policy "lectura publica tribunales" on tribunales for select using (true);

-- app_config no tiene políticas -> RLS deniega todo acceso directo
-- (ni siquiera lectura), solo accesible desde las funciones SECURITY DEFINER.

revoke insert, update, delete on personas from anon, authenticated;
revoke insert, update, delete on tribunales from anon, authenticated;

-- ---------------------------------------------------------------------
-- Funciones de escritura (verifican la clave de administrador)
-- ---------------------------------------------------------------------
create or replace function verify_admin(admin_password text)
returns boolean
language plpgsql
security definer
set search_path = public
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
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

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
end;
$$;

create or replace function admin_delete_persona(admin_password text, persona_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;
  delete from personas where id = persona_id;
end;
$$;

create or replace function admin_update_ficha(admin_password text, ficha_id text, patch jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

  update tribunales set
    ministro_visitador = patch->>'ministroVisitador',
    correo = patch->>'correo',
    telefono = patch->>'telefono',
    competencias = coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(patch->'competencias', '[]'::jsonb)) x), '{}'),
    updated_at = now()
  where id = ficha_id;
end;
$$;

grant execute on function admin_upsert_persona(text, jsonb) to anon, authenticated;
grant execute on function admin_delete_persona(text, text) to anon, authenticated;
grant execute on function admin_update_ficha(text, text, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Tiempo real: para que los cambios se vean al instante en todas las
-- pantallas abiertas, sin necesidad de recargar la página.
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table personas;
alter publication supabase_realtime add table tribunales;
