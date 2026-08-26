# Directorio Judicial · Corte de Apelaciones de La Serena

Plataforma web para buscar y consultar rápidamente contactos, correos y
anexos telefónicos de la Corte de Apelaciones de La Serena, sus unidades
especializadas (Insolvencia, CINJ, ULE, CSMP, CAPJ Zonal) y los 26
tribunales de primera instancia de la IV Región de Coquimbo.

## Características

- **Búsqueda global instantánea** por nombre, cargo, unidad, tribunal,
  correo, anexo o RUT (sin distinguir mayúsculas/acentos).
- **Navegación por secciones**: Corte de Apelaciones, Tribunales de la
  Jurisdicción, Insolvencia, CINJ, ULE, CSMP y CAPJ Zonal.
- **Filtro por comuna** dentro de Tribunales (La Serena, Coquimbo, Ovalle,
  Illapel, Vicuña, Combarbalá, Los Vilos, Andacollo).
- **Ficha rápida por tribunal**: correo general, teléfono, ministro(a)
  visitador(a) y competencias (Civil, Laboral, Familia, Penal, etc.).
- Copiado de correo/anexo con un clic, enlaces `mailto:`/`tel:`.
- Aviso de cumpleaños del día y modo oscuro/claro.

## Desarrollo

```bash
npm install
npm run dev
```

## Actualizar los datos

Los contactos se generan a partir del Excel fuente en
`data/source/agenda-corte.xlsx` (pestañas *Anexos*, *Dotación*,
*Jurisdicción* y *correos tribunales*). Para regenerar
`src/data/directorio.json` tras actualizar ese archivo:

```bash
pip install -r scripts/requirements.txt
python3 scripts/build_data.py
```

## Build de producción

```bash
npm run build   # genera dist/
npm run preview
```
