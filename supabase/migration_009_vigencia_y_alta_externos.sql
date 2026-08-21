-- Dos mejoras solicitadas:
-- 1) Permitir agregar contactos externos nuevos desde la plataforma (antes
--    solo se podían editar o eliminar los cargados desde la planilla).
-- 2) Vigencia de cargos transitorios (reemplazo, suplencia, interinato):
--    el administrador puede indicar "vigente desde/hasta"; cuando la fecha
--    "hasta" ya pasó, la tarjeta se marca en naranjo para avisar que hay
--    que actualizar la vigencia o dejar el cargo vacante.

alter table personas add column if not exists vigencia_desde date;
alter table personas add column if not exists vigencia_hasta date;

alter table contactos_externos add column if not exists vigencia_desde date;
alter table contactos_externos add column if not exists vigencia_hasta date;

-- Los contactos externos cargados desde la planilla traen su orden original
-- por categoría (0..N); los que agregue un administrador después reciben un
-- número más alto automáticamente, igual que ya ocurre con "personas".
create sequence if not exists contactos_externos_orden_seq start 100000;

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

  insert into cambios (tipo, entidad, detalle)
  values (
    case when ya_existia then 'persona_editada' else 'persona_agregada' end,
    p->>'nombre',
    p->>'unidad'
  );
end;
$$;

-- Antes solo actualizaba una fila existente; ahora crea el contacto si el
-- id no existe todavía (alta desde la sección "Externo").
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

  insert into cambios (tipo, entidad, detalle)
  values (
    case when ya_existia then 'contacto_externo_editado' else 'contacto_externo_agregado' end,
    coalesce(patch->>'nombre', patch->>'institucion', contacto_id),
    null
  );
end;
$$;

grant execute on function admin_upsert_persona(text, jsonb) to anon, authenticated;
grant execute on function admin_update_contacto_externo(text, text, jsonb) to anon, authenticated;
