-- Agrega dirección y múltiples teléfonos por tribunal.
-- Algunos tribunales tienen un solo teléfono, otros varios (mesón, OIRS,
-- fax, etc.), por eso se usa un arreglo de texto en vez de un solo campo.
-- Si el tribunal ya tenía algo cargado en la columna "telefono" (antigua,
-- de un solo valor), se traspasa automáticamente al nuevo arreglo para no
-- perder datos existentes.

alter table tribunales add column if not exists telefonos text[] not null default '{}';
alter table tribunales add column if not exists direccion text;

update tribunales
set telefonos = array[telefono]
where telefono is not null and telefono <> '' and telefonos = '{}';

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

  insert into cambios (tipo, entidad, detalle)
  values ('ficha_editada', coalesce(nombre_tribunal, ficha_id), null);
end;
$$;
