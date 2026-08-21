-- Corrige la marca "es_generico" de filas que en realidad son etiquetas de
-- sala/anexo (no una persona) y por eso no deben contarse como
-- "funcionario" en los grupos de correo masivo (ej. "Funcionarios de la
-- Corte"). Estas filas quedaron con es_generico = false desde la carga
-- inicial de la planilla.
update personas set es_generico = true
where unidad = 'Salas'
  and lower(nombre) in (
    '1a. sala presidente',
    '1a. salas ministros',
    '2a. sala digitadora',
    '2a. sala ministros',
    '3a. sala'
  );

update personas set es_generico = true
where lower(unidad) = 'sala de reuniones' and lower(nombre) = 'sala de reuniones';
