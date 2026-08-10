-- Migración: agrega correo de administrador/secretario y de un segundo
-- responsable a la ficha de cada tribunal.
-- Ejecutar una sola vez en el SQL Editor de Supabase, en el proyecto que
-- ya tiene el esquema original instalado.

alter table tribunales add column if not exists correo_admin_secretario text;
alter table tribunales add column if not exists correo_segundo_lider text;

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
    correo_admin_secretario = patch->>'correoAdminSecretario',
    correo_segundo_lider = patch->>'correoSegundoLider',
    updated_at = now()
  where id = ficha_id;

  insert into cambios (tipo, entidad, detalle)
  values ('ficha_editada', coalesce(nombre_tribunal, ficha_id), null);
end;
$$;
