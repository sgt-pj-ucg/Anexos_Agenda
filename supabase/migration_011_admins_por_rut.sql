-- Reemplaza la clave de administrador única y compartida por una lista de
-- administradores individuales, cada uno con su propio RUT y clave de
-- acceso. Las contraseñas de abajo están hasheadas (SHA-256), nunca en
-- texto plano.

create table if not exists admins (
  rut text primary key,
  nombre text not null,
  password_hash text not null
);

alter table admins enable row level security;
-- Sin políticas de lectura/escritura directa: solo accesible desde las
-- funciones SECURITY DEFINER de abajo (igual que app_config).
revoke all on admins from anon, authenticated;

insert into admins (rut, nombre, password_hash) values
('9944272-7', 'Miriam Ruth Véliz Cortés', 'dea6b75cb2065d381d5231209b4c2833db500a3497934a449c3994c523535bae'),
('13651825-9', 'Magaly Isabel Retamales Venegas', '87af510922268c1ef06ecabc0005699d695d03e3c02d65aceb06e9aa55fd5475'),
('10117477-8', 'Sandra Del Carmen Jauriat Moya', '93f426cb88384c2b2f9f5095f5a9d5a8fcba4b79f14437bced3d68a683156ac6'),
('16109447-1', 'Viviana Noemí Carvajal Carvajal', '7c67374f8e5c02aababb0b7414a08b78b790a866300d97912d4034155892158f'),
('12444689-9', 'Chrysley Rudecinda Santander Alfaro', 'f60328cfec776e3fd5aa18f419eeaab2aa60febf495f1adc7054b1056092988d'),
('13761912-1', 'Carolina De Los Angeles Marchant Rojas', 'fcc8d5756135d5f79cc4a8ae29929fb3187ec4d18f8daeef071c14d47debeb17'),
('18028789-2', 'Gianina Gigliola María Rojas Olivier', 'ecd84be9d4b2e5d40bdcd0e92e36c9f5b5b5ab194ae7c60e45a16258e755a9be'),
('12570532-4', 'Andrea Gabriela Mauad Julio', 'e32b78aec168df7c8b30f06ff9899963ddeb6197f7432d48c9b846845a7beb37'),
('9451502-5', 'Héctor Iván Martínez Juica', 'ff8995c11435fc613d6a355b73f94b0ae71336dfeaecf04d9d7cdde04da07da9'),
('14379056-8', 'Naldo Domerico Vicencio Tapia', '06a6c9f0501837a05b31ea968003591d41f59e7a939aa3deb93d57357316c555'),
('17113679-2', 'Sonia Alejandra Caimanque Araya', 'da94828dc67918a4ddef838754240cdd52c54930061f608232570a76c60a1fce'),
('15870852-3', 'Juan Carlos Olave Soto', '36bd54becb6e27e1127af84e25f7d35d4cb3b5e39c29d27bc521e7f236190188'),
('18062446-5', 'Camila De Jesús Ortiz Valdivia', '8f74572ce0913fe0d89aebd64e4dcd69e44ae1394469d8745fc357d9d916d56d'),
('18179901-3', 'Axeline Yeritza Aguilera Alcayaga', '113dc08b4eca6447ecd4d9b2af06e589313db04d16591d4a99d518a4f267b1f9'),
('9693215-4', 'Hugo Alexis Contreras Puyo', 'c538292f976a9b85742fab67ca22f7503dd66bdda189bb1e890c123ae01de62a'),
('10186440-5', 'Ricardo Antonio Pizarro González', '832e6bdcb77e962c950071fd29a6d5b5349d55158c61420facd59ae54f2bb016'),
('11961346-9', 'Scarlett Marcela Berríos Molina', 'e500c1ecbb6971bcf884e1887967a4af4cb392e8dbc2bb0fa71eed4536cf2fee'),
('19154833-7', 'Lía Victoria Flores Velásquez', '62b51050238f5edfbe9713cfe96b8a1604d4faf4328186559071b2c051ccdcde'),
('19041529-5', 'Camila Michel Tapia Pastén', 'd94e8e30ae0c793971c4966c472fa3f2f10b24e76a1dda2b518caec68123df5f'),
('19758764-4', 'Gustavo Eduardo Talcado Vidal', '7f8ae98dfa26c5ebe7c6d109997b3899956d43008cf59d3fdfd5e3c178ddd054')
on conflict (rut) do update set
  nombre = excluded.nombre,
  password_hash = excluded.password_hash;

-- Verifica RUT + clave para el login (pantalla "Acceso administrador").
create or replace function verify_admin_login(admin_rut text, admin_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored text;
begin
  select password_hash into stored from admins where rut = admin_rut;
  return stored is not null and encode(digest(admin_password, 'sha256'), 'hex') = stored;
end;
$$;

-- A partir de ahora valida contra la lista de administradores (antes
-- comparaba contra una única clave guardada en app_config). La clave
-- compartida "Admin1849" deja de funcionar; cada persona usa la suya.
create or replace function verify_admin(admin_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return exists (
    select 1 from admins where password_hash = encode(digest(admin_password, 'sha256'), 'hex')
  );
end;
$$;

grant execute on function verify_admin_login(text, text) to anon, authenticated;
