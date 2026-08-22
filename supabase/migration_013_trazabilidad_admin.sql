-- Trazabilidad: cada cambio queda registrado con el nombre del
-- administrador que lo hizo, y el login devuelve su nombre para mostrarlo
-- junto al indicador "Admin" del encabezado.

alter table cambios add column if not exists admin_nombre text;

-- Busca el nombre del administrador dueño de esta clave (asume claves
-- únicas por administrador, que es como se cargaron en migration_011).
create or replace function admin_nombre(admin_password text)
returns text
language sql
security definer
set search_path = public, extensions
as $$
  select nombre from admins where password_hash = encode(digest(admin_password, 'sha256'), 'hex') limit 1;
$$;

-- Antes devolvía solo true/false; ahora devuelve el nombre del
-- administrador (o null si el RUT/clave no son correctos), para mostrarlo
-- en el encabezado tras iniciar sesión.
create or replace function verify_admin_login(admin_rut text, admin_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored text;
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

grant execute on function admin_nombre(text) to anon, authenticated;
grant execute on function verify_admin_login(text, text) to anon, authenticated;
