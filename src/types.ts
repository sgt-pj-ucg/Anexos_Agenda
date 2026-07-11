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
  telefono: string | null
  ministroVisitador: string | null
  competencias: string[]
  comuna: string | null
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
  rut: string | null
  grado: string | null
  calidadJuridica: string | null
  esGenerico: boolean
  vacante?: boolean
  suplente?: string | null
  comuna: string | null
  fuente?: string
  fichaTribunal: FichaTribunal | null
}

export interface Directorio {
  generatedAt: string
  totalPersonas: number
  people: Persona[]
  tribunales: FichaTribunal[]
  correoGeneralSeccion: Record<string, string>
}
