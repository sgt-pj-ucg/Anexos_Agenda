-- Carga inicial de dirección y teléfonos desde la pestaña "Datos Dirección
-- y teléfonos" de la planilla. Se actualiza por correo genérico (dato
-- único y ya cargado) en vez de por nombre, para evitar errores de
-- coincidencia. Después de esta carga inicial, cualquier corrección se
-- hace directamente desde la plataforma (editar ficha del tribunal).

update tribunales set direccion = 'Rengifo N° 240, La Serena', telefonos = array['512338300'] where correo = 'jllaserena1@pjud.cl';
update tribunales set direccion = 'Rengifo N° 240, La Serena', telefonos = array['512-338333'] where correo = 'jllaserena2@pjud.cl';
update tribunales set direccion = 'Rengifo N° 240, La Serena', telefonos = array['512338365'] where correo = 'jllaserena3@pjud.cl';
update tribunales set direccion = 'Santiago Trigo N° 511, Coquimbo', telefonos = array['51-2-321447', '51-2-325980'] where correo = 'jlcoquimbo1@pjud.cl';
update tribunales set direccion = 'Santiago Trigo N° 511, Coquimbo', telefonos = array['512321584'] where correo = 'jlcoquimbo2@pjud.cl';
update tribunales set direccion = 'Santiago Trigo N° 511, Coquimbo', telefonos = array['512320483'] where correo = 'jlcoquimbo3@pjud.cl';
update tribunales set direccion = 'Antonio Tirado N° 140, Ovalle', telefonos = array['532620259'] where correo = 'jlovalle1@pjud.cl';
update tribunales set direccion = 'Antonio Tirado N° 140, Ovalle', telefonos = array['532620172', '952038213'] where correo = 'jlovalle2@pjud.cl';
update tribunales set direccion = 'Gabriela Mistral N° 95, Ovalle', telefonos = array['532620082'] where correo = 'jlovalle3@pjud.cl';
update tribunales set direccion = 'José del Solar N° 350, Illapel', telefonos = array['53-2521253', '53-2521585', '53-2523360', '53-2524615'] where correo = 'jlillapel@pjud.cl';
update tribunales set direccion = 'Chacabuco S/N, Vicuña', telefonos = array['(51) 2412 128', '(51) 2411 279'] where correo = 'jl_vicuna@pjud.cl';
update tribunales set direccion = 'Urmeneta N° 743, Andacollo', telefonos = array['974181568'] where correo = 'jlyg_andacollo@pjud.cl';
update tribunales set direccion = 'Plaza de Armas S/N, Combarbalá', telefonos = array['53-2741013'] where correo = 'jlyg_combarbala@pjud.cl';
update tribunales set direccion = 'Lautaro N° 330, Los Vilos', telefonos = array['53-2541198', '53-2542227', '53-2542848'] where correo = 'jlyg_losvilos@pjud.cl';
update tribunales set direccion = 'Av. El Santo N° 1069, La Serena', telefonos = array['512219613'] where correo = 'jglaserena@pjud.cl';
update tribunales set direccion = 'Melgarejo N° 942, Coquimbo', telefonos = array['51 2 325385', '51 2 315441'] where correo = 'jgcoquimbo@pjud.cl';
update tribunales set direccion = 'Vicuña Mackenna N° 575, Ovalle', telefonos = array['532630044', '532630047', '532632903'] where correo = 'jgovalle@pjud.cl';
update tribunales set direccion = 'Independencia N° 0362, Illapel', telefonos = array['(53) 2524265', '(53) 2521085', '(53) 2524571'] where correo = 'jgillapel@pjud.cl';
update tribunales set direccion = 'O''Higgins N° 745, Vicuña', telefonos = array['(51) 2 412270', '(51) 2 412673'] where correo = 'jgvicuna@pjud.cl';
update tribunales set direccion = 'Rengifo N° 240, La Serena', telefonos = array['51 2 338500'] where correo = 'jlablaserena@pjud.cl';
update tribunales set direccion = 'Rengifo N° 240, La Serena', telefonos = array['51 2 338 400'] where correo = 'jflaserena@pjud.cl';
update tribunales set direccion = 'Santiago Trigo N° 511, Coquimbo', telefonos = array['51 2 325529'] where correo = 'jfcoquimbo@pjud.cl';
update tribunales set direccion = 'Libertad N° 652, Ovalle', telefonos = array['532634717'] where correo = 'jfovalle@pjud.cl';
update tribunales set direccion = 'Av. El Santo N° 1069, La Serena', telefonos = array['51-2222377', '51-2211868', '51-2218760'] where correo = 'toplaserena@pjud.cl';
update tribunales set direccion = 'Vicuña Mackenna N° 575, Ovalle', telefonos = array['53-2630033', '53-2635123'] where correo = 'topovalle@pjud.cl';
