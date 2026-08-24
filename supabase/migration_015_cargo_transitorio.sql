-- Cargo transitorio: comisión de servicio de un funcionario en otro
-- tribunal o unidad de la Corte, con regreso automático a su tribunal de
-- origen al vencer la fecha "hasta". No reemplaza a "vigencia_desde/hasta"
-- (que es para reemplazos en el MISMO cargo) ni al traslado permanente ya
-- existente (que mueve a la persona sin fecha de regreso).
-- Ejecutar una sola vez en el Editor SQL de Supabase. Es seguro volver a
-- ejecutar este archivo completo si algo falla a mitad de camino.

alter table personas add column if not exists cargo_transitorio text;
alter table personas add column if not exists tribunal_transitorio text;
alter table personas add column if not exists unidad_transitorio text;
alter table personas add column if not exists seccion_transitorio text;
alter table personas add column if not exists comuna_transitorio text;
alter table personas add column if not exists transitorio_desde date;
alter table personas add column if not exists transitorio_hasta date;

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
    vigencia_desde, vigencia_hasta,
    cargo_transitorio, tribunal_transitorio, unidad_transitorio,
    seccion_transitorio, comuna_transitorio, transitorio_desde, transitorio_hasta,
    orden, updated_at
  )
  values (
    p->>'id', p->>'nombre', p->>'cargo', p->>'unidad', p->>'seccion', p->>'tribunal',
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'correos', '[]'::jsonb)) x), '{}'),
    p->>'anexo', p->>'cumpleanos', p->>'grado', p->>'calidadJuridica',
    coalesce((p->>'esGenerico')::boolean, false),
    coalesce((p->>'vacante')::boolean, false),
    p->>'suplente', p->>'comuna',
    nullif(p->>'vigenciaDesde', '')::date, nullif(p->>'vigenciaHasta', '')::date,
    p->>'cargoTransitorio', p->>'tribunalTransitorio', p->>'unidadTransitorio',
    p->>'seccionTransitorio', p->>'comunaTransitorio',
    nullif(p->>'transitorioDesde', '')::date, nullif(p->>'transitorioHasta', '')::date,
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
    cargo_transitorio = excluded.cargo_transitorio,
    tribunal_transitorio = excluded.tribunal_transitorio,
    unidad_transitorio = excluded.unidad_transitorio,
    seccion_transitorio = excluded.seccion_transitorio,
    comuna_transitorio = excluded.comuna_transitorio,
    transitorio_desde = excluded.transitorio_desde,
    transitorio_hasta = excluded.transitorio_hasta,
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

grant execute on function admin_upsert_persona(text, jsonb) to anon, authenticated;
