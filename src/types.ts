export type Seccion =
  | 'corte'
  | 'insolvencia'
  | 'cinj'
  | 'csmp'
  | 'ule'
  | 'capj'
  | 'tribunal'

export interface FichaTribunal {
  id: string
  nombre: string
  correo: string | null
  telefonos: string[]
  direccion: string | null
  ministroVisitador: string | null
  competencias: string[]
  comuna: string | null
  correoAdminSecretario: string | null
  correoSegundoLider: string | null
}

export interface Persona {
  id: string
  nombre: string
  cargo: string | null
  unidad: string
  seccion: Seccion
  tribunal: string | null
  correos: string[]
  anexo: string | null
  cumpleanos: string | null
  grado: string | null
  calidadJuridica: string | null
  esGenerico: boolean
  vacante?: boolean
  suplente?: string | null
  comuna: string | null
  fuente?: string
  vigenciaDesde: string | null
  vigenciaHasta: string | null
  // Cargos transitorios (comisiones de servicio en otro tribunal o unidad
  // de la Corte): un funcionario puede tener varios períodos, uno por cada
  // vez que rota. Mientras el de hoy está vigente, sus datos reemplazan a
  // los de arriba en toda la plataforma (buscador, grupos, organigrama);
  // fuera de todo período, la persona vuelve sola a su tribunal de origen.
  cargosTransitorios: CargoTransitorioPeriodo[]
  // Ausentismo (licencia médica, feriado legal, permiso, etc.): no mueve a
  // la persona de tribunal, solo la marca como ausente mientras está
  // vigente; al pasar "ausenteHasta" vuelve sola a la normalidad.
  ausenteTipo: string | null
  ausenteMotivo: string | null
  ausenteDesde: string | null
  ausenteHasta: string | null
  // Agregados en memoria por aplicarCargoTransitorio()/aplicarAusentismo()
  // cuando corresponde: no se guardan en la base de datos.
  enComision?: boolean
  origenCargo?: string | null
  origenUnidad?: string
  origenTribunal?: string | null
  origenCalidadJuridica?: string | null
  periodoActivo?: CargoTransitorioPeriodo
  ausente?: boolean
}

export interface CargoTransitorioPeriodo {
  id: string
  cargo: string | null
  calidadJuridica: string | null
  tribunal: string | null
  unidad: string | null
  seccion: Seccion | null
  comuna: string | null
  desde: string | null
  hasta: string | null
}

export type CategoriaExterna =
  | 'academia_judicial'
  | 'cbr_notarias'
  | 'cortes_pais'
  | 'receptores_procuradores'
  | 'policia_local'

export interface ContactoExterno {
  id: string
  categoria: CategoriaExterna
  institucion: string | null
  nombre: string | null
  cargo: string | null
  comuna: string | null
  correos: string[]
  telefonos: string[]
  direccion: string | null
  calidadJuridica: string | null
  observaciones: string | null
  orden: number
  vigenciaDesde: string | null
  vigenciaHasta: string | null
}

export type CambioTipo =
  | 'persona_agregada'
  | 'persona_editada'
  | 'persona_eliminada'
  | 'ficha_editada'
  | 'contacto_externo_agregado'
  | 'contacto_externo_editado'
  | 'contacto_externo_eliminado'
  | 'grupo_correo_creado'
  | 'grupo_correo_editado'
  | 'grupo_correo_eliminado'

export interface Cambio {
  id: number
  createdAt: string
  tipo: CambioTipo
  entidad: string
  detalle: string | null
  adminNombre: string | null
}

export type ReporteEstado = 'pendiente' | 'resuelto'

export interface Reporte {
  id: number
  createdAt: string
  entidad: string
  contexto: string | null
  descripcion: string
  estado: ReporteEstado
  resolvedAt: string | null
}

// Grupos de correo especiales: listas armadas a mano por un administrador
// para envíos que se repiten seguido (ver GruposCorreoModal). "nombre" en un
// integrante es opcional: puede ser un correo institucional genérico (ej. un
// juzgado) sin una persona asociada.
export interface GrupoCorreoMiembro {
  correo: string
  nombre: string | null
}

export interface GrupoCorreo {
  id: string
  nombre: string
  miembros: GrupoCorreoMiembro[]
}

export interface Directorio {
  generatedAt: string
  totalPersonas: number
  people: Persona[]
  tribunales: FichaTribunal[]
  correoGeneralSeccion: Record<string, string>
}
