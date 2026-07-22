-- Migración: agrega el registro de "novedades" (panel de cambios).
-- Ejecutar una sola vez en el SQL Editor de Supabase, en el proyecto que
-- ya tiene el esquema original (schema.sql) instalado.

create table if not exists cambios (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tipo text not null,
  entidad text not null,
  detalle text
);

alter table cambios enable row level security;

drop policy if exists "lectura publica cambios" on cambios;
create policy "lectura publica cambios" on cambios for select using (true);

revoke insert, update, delete on cambios from anon, authenticated;

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

grant execute on function admin_upsert_persona(text, jsonb) to anon, authenticated;
grant execute on function admin_delete_persona(text, text) to anon, authenticated;
grant execute on function admin_update_ficha(text, text, jsonb) to anon, authenticated;

alter publication supabase_realtime add table cambios;
