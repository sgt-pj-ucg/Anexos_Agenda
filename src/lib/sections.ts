import {
  Banknote,
  Building2,
  Gavel,
  Landmark,
  LayoutGrid,
  Scale,
  Send,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { Seccion } from '../types'

export type SeccionKey = Seccion | 'todos'

export interface SectionMeta {
  key: SeccionKey
  label: string
  short: string
  icon: LucideIcon
  description: string
}

export const SECTION_ORDER: SeccionKey[] = [
  'todos',
  'corte',
  'tribunal',
  'insolvencia',
  'cinj',
  'ule',
  'csmp',
  'capj',
]

export const SECTION_META: Record<SeccionKey, SectionMeta> = {
  todos: {
    key: 'todos',
    label: 'Todos los contactos',
    short: 'Todos',
    icon: LayoutGrid,
    description: 'Toda la agenda judicial de la jurisdicción en un solo lugar',
  },
  corte: {
    key: 'corte',
    label: 'Corte de Apelaciones de La Serena',
    short: 'Corte de Apelaciones',
    icon: Landmark,
    description: 'Presidencia, ministros, relatoría, fiscalía judicial y unidades internas',
  },
  tribunal: {
    key: 'tribunal',
    label: 'Tribunales de la Jurisdicción',
    short: 'Tribunales',
    icon: Gavel,
    description: '26 tribunales de primera instancia de la IV Región de Coquimbo',
  },
  insolvencia: {
    key: 'insolvencia',
    label: 'Insolvencia y Reemprendimiento',
    short: 'Insolvencia',
    icon: Scale,
    description: 'Unidad de insolvencia de la Corte de Apelaciones',
  },
  cinj: {
    key: 'cinj',
    label: 'Centro Integrado de Notificaciones Judiciales',
    short: 'CINJ',
    icon: Send,
    description: 'Notificaciones judiciales de toda la jurisdicción',
  },
  ule: {
    key: 'ule',
    label: 'Unidad de Liquidaciones Especializadas',
    short: 'ULE',
    icon: Banknote,
    description: 'Liquidaciones concursales especializadas',
  },
  csmp: {
    key: 'csmp',
    label: 'Centro de Seguimiento de Medidas de Protección',
    short: 'CSMP',
    icon: ShieldCheck,
    description: 'Seguimiento y control de medidas de protección de familia',
  },
  capj: {
    key: 'capj',
    label: 'CAPJ Zonal La Serena',
    short: 'CAPJ Zonal',
    icon: Building2,
    description: 'Corporación Administrativa del Poder Judicial, soporte a toda la jurisdicción',
  },
}
