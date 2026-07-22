-- Migración: agrega la bandeja de "Reportes" (avisos de dato incorrecto).
-- Ejecutar una sola vez en el SQL Editor de Supabase, en el proyecto que
-- ya tiene el esquema original y la migración de novedades instalados.

create table if not exists reportes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  entidad text not null,
  contexto text,
  descripcion text not null,
  estado text not null default 'pendiente',
  resolved_at timestamptz
);

alter table reportes enable row level security;

drop policy if exists "lectura publica reportes" on reportes;
create policy "lectura publica reportes" on reportes for select using (true);

drop policy if exists "crear reporte publico" on reportes;
create policy "crear reporte publico" on reportes for insert
  with check (estado = 'pendiente' and resolved_at is null);

revoke update, delete on reportes from anon, authenticated;

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

grant execute on function admin_set_reporte_estado(text, bigint, text) to anon, authenticated;

alter publication supabase_realtime add table reportes;
