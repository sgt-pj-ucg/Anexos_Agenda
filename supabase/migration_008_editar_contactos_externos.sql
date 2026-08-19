-- Permite al administrador editar y eliminar contactos externos (CBR y
-- Notarías, Policía Local, Receptores/Procuradores, Cortes del País,
-- Academia Judicial) desde la propia plataforma.

create or replace function admin_update_contacto_externo(admin_password text, contacto_id text, patch jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  nombre_previo text;
begin
  if not verify_admin(admin_password) then
    raise exception 'Clave de administrador incorrecta';
  end if;

  select nombre into nombre_previo from contactos_externos where id = contacto_id;

  update contactos_externos set
    institucion = patch->>'institucion',
    nombre = patch->>'nombre',
    cargo = patch->>'cargo',
    comuna = patch->>'comuna',
    correos = coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(patch->'correos', '[]'::jsonb)) x), '{}'),
    telefonos = coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(patch->'telefonos', '[]'::jsonb)) x), '{}'),
    direccion = patch->>'direccion',
    calidad_juridica = patch->>'calidadJuridica',
    observaciones = patch->>'observaciones',
    updated_at = now()
  where id = contacto_id;

  insert into cambios (tipo, entidad, detalle)
  values ('contacto_externo_editado', coalesce(patch->>'nombre', nombre_previo, contacto_id), null);
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
    insert into cambios (tipo, entidad, detalle) values ('contacto_externo_eliminado', nombre_contacto, null);
  end if;
end;
$$;

grant execute on function admin_update_contacto_externo(text, text, jsonb) to anon, authenticated;
grant execute on function admin_delete_contacto_externo(text, text) to anon, authenticated;

-- Para que las ediciones se vean al instante en todas las pantallas
-- abiertas, igual que el resto del directorio.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'contactos_externos'
  ) then
    alter publication supabase_realtime add table contactos_externos;
  end if;
end $$;
