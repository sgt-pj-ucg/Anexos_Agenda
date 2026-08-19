import { Award, Gavel, Landmark, ScrollText, Users } from 'lucide-react'
import type { CategoriaExterna } from '../types'

interface CategoriaMeta {
  key: CategoriaExterna
  label: string
  short: string
  description: string
  icon: typeof Landmark
}

export const CATEGORIA_ORDER: CategoriaExterna[] = [
  'cbr_notarias',
  'policia_local',
  'receptores_procuradores',
  'cortes_pais',
  'academia_judicial',
]

export const CATEGORIA_META: Record<CategoriaExterna, CategoriaMeta> = {
  cbr_notarias: {
    key: 'cbr_notarias',
    label: 'CBR y Notarías',
    short: 'CBR y Notarías',
    description: 'Conservadores de Bienes Raíces y notarías de la jurisdicción',
    icon: ScrollText,
  },
  policia_local: {
    key: 'policia_local',
    label: 'Juzgados de Policía Local',
    short: 'Policía Local',
    description: 'Juzgados de Policía Local de la IV Región de Coquimbo',
    icon: Gavel,
  },
  receptores_procuradores: {
    key: 'receptores_procuradores',
    label: 'Receptores y Procuradores',
    short: 'Receptores y Proc.',
    description: 'Receptores judiciales, defensores públicos y procuradores del número',
    icon: Users,
  },
  cortes_pais: {
    key: 'cortes_pais',
    label: 'Cortes del País',
    short: 'Cortes del País',
    description: 'Corte Suprema y Cortes de Apelaciones de todo Chile',
    icon: Landmark,
  },
  academia_judicial: {
    key: 'academia_judicial',
    label: 'Academia Judicial',
    short: 'Academia Judicial',
    description: 'Contactos de la Academia Judicial',
    icon: Award,
  },
}
