-- Agrega la unidad "Abogados Integrantes" a la Corte de Apelaciones,
-- ubicada justo después de "Ministros" en el listado.
--
-- Los grupos se muestran en el orden en que aparece por primera vez cada
-- "unidad" al recorrer las personas ordenadas por su columna "orden". Para
-- insertar esta unidad entre Ministros (orden 1-6) y la que sigue (Fiscalía
-- Judicial, orden 7 en adelante) se corre primero todo el resto de Corte
-- +10, dejando 5 números libres (7-11) para los abogados integrantes.
update personas set orden = orden + 10 where seccion = 'corte' and orden >= 7;

insert into personas (
  id, nombre, cargo, unidad, seccion, tribunal, correos, anexo, cumpleanos,
  grado, calidad_juridica, es_generico, vacante, suplente, comuna, orden, updated_at
) values
('pia-bustos-fuentes-abogados-integrantes', 'Pía Bustos Fuentes', 'Primera Abogada Integrante', 'Abogados Integrantes', 'corte', 'Corte de Apelaciones de La Serena', array['pbustosf@pjud.cl'], null, null, null, null, false, false, null, 'La Serena', 7, now()),
('carolina-salas-salazar-abogados-integrantes', 'Carolina Salas Salazar', 'Segunda Abogada Integrante', 'Abogados Integrantes', 'corte', 'Corte de Apelaciones de La Serena', array['csalass@pjud.cl'], null, null, null, null, false, false, null, 'La Serena', 8, now()),
('jaime-camus-del-valle-abogados-integrantes', 'Jaime Camus del Valle', 'Tercer Abogado Integrante', 'Abogados Integrantes', 'corte', 'Corte de Apelaciones de La Serena', array['jecamus@pjud.cl'], null, null, null, null, false, false, null, 'La Serena', 9, now()),
('gabriel-gallardo-verdugo-abogados-integrantes', 'Gabriel Gallardo Verdugo', 'Cuarto Abogado Integrante', 'Abogados Integrantes', 'corte', 'Corte de Apelaciones de La Serena', array['ggallardov@pjud.cl'], null, null, null, null, false, false, null, 'La Serena', 10, now()),
('jorge-fonseca-dittus-abogados-integrantes', 'Jorge Fonseca Dittus', 'Quinto Abogado Integrante', 'Abogados Integrantes', 'corte', 'Corte de Apelaciones de La Serena', array['jfonseca@pjud.cl'], null, null, null, null, false, false, null, 'La Serena', 11, now())
on conflict (id) do update set
  nombre = excluded.nombre,
  cargo = excluded.cargo,
  unidad = excluded.unidad,
  correos = excluded.correos,
  orden = excluded.orden,
  updated_at = now();
