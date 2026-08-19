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
}

export type CambioTipo =
  | 'persona_agregada'
  | 'persona_editada'
  | 'persona_eliminada'
  | 'ficha_editada'
  | 'contacto_externo_editado'
  | 'contacto_externo_eliminado'

export interface Cambio {
  id: number
  createdAt: string
  tipo: CambioTipo
  entidad: string
  detalle: string | null
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

export interface Directorio {
  generatedAt: string
  totalPersonas: number
  people: Persona[]
  tribunales: FichaTribunal[]
  correoGeneralSeccion: Record<string, string>
}
