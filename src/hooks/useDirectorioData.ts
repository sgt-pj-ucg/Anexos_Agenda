import { useCallback, useEffect, useState } from 'react'
import { directorio } from '../data'
import { supabase } from '../lib/supabaseClient'
import { getAdminPassword } from '../lib/auth'
import { slugify } from '../lib/normalize'
import type { FichaTribunal, Persona, Seccion } from '../types'

interface PersonaRow {
  id: string
  nombre: string
  cargo: string | null
  unidad: string
  seccion: Seccion
  tribunal: string | null
  correos: string[] | null
  anexo: string | null
  cumpleanos: string | null
  grado: string | null
  calidad_juridica: string | null
  es_generico: boolean
  vacante: boolean
  suplente: string | null
  comuna: string | null
  orden: number
  updated_at: string
}

interface TribunalRow {
  id: string
  nombre: string
  correo: string | null
  telefono: string | null
  ministro_visitador: string | null
  competencias: string[] | null
  comuna: string | null
  updated_at: string
}

function rowToPersona(row: PersonaRow): Persona {
  return {
    id: row.id,
    nombre: row.nombre,
    cargo: row.cargo,
    unidad: row.unidad,
    seccion: row.seccion,
    tribunal: row.tribunal,
    correos: row.correos ?? [],
    anexo: row.anexo,
    cumpleanos: row.cumpleanos,
    grado: row.grado,
    calidadJuridica: row.calidad_juridica,
    esGenerico: row.es_generico,
    vacante: row.vacante,
    suplente: row.suplente,
    comuna: row.comuna,
  }
}

function rowToFicha(row: TribunalRow): FichaTribunal {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    telefono: row.telefono,
    ministroVisitador: row.ministro_visitador,
    competencias: row.competencias ?? [],
    comuna: row.comuna,
  }
}

function uniqueId(base: string, existing: Set<string>): string {
  let id = slugify(base) || 'contacto'
  let n = 1
  while (existing.has(id)) {
    id = `${slugify(base)}-${n}`
    n += 1
  }
  return id
}

function requireAdminPassword(): string {
  const password = getAdminPassword()
  if (!password) throw new Error('Se requiere sesión de administrador para guardar cambios.')
  return password
}

function friendlyMessage(raw: string): string {
  if (/fetch|network|conexi[oó]n/i.test(raw)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.'
  }
  return raw
}

export function useDirectorioData() {
  const [people, setPeople] = useState<Persona[]>([])
  const [tribunales, setTribunales] = useState<FichaTribunal[]>([])
  const [generatedAt, setGeneratedAt] = useState(directorio.generatedAt)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [personasRes, tribunalesRes] = await Promise.all([
      supabase.from('personas').select('*').order('orden', { ascending: true }),
      supabase.from('tribunales').select('*'),
    ])

    if (personasRes.error || tribunalesRes.error) {
      const message = personasRes.error?.message ?? tribunalesRes.error?.message ?? ''
      setError(friendlyMessage(message) || 'No se pudo cargar el directorio.')
      setLoading(false)
      return
    }

    const personaRows = (personasRes.data ?? []) as PersonaRow[]
    const tribunalRows = (tribunalesRes.data ?? []) as TribunalRow[]

    setPeople(personaRows.map(rowToPersona))
    setTribunales(tribunalRows.map(rowToFicha))

    const latest = [...personaRows, ...tribunalRows]
      .map((r) => r.updated_at)
      .filter(Boolean)
      .sort()
      .pop()
    if (latest) setGeneratedAt(latest.slice(0, 10))

    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()

    const channel = supabase
      .channel('directorio-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personas' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tribunales' }, () => load())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  const writePersona = async (persona: Persona) => {
    const admin_password = requireAdminPassword()
    const { error: rpcError } = await supabase.rpc('admin_upsert_persona', {
      admin_password,
      p: persona,
    })
    if (rpcError) throw new Error(friendlyMessage(rpcError.message))
    await load()
  }

  const updatePerson = async (patch: Partial<Persona>, id: string) => {
    const current = people.find((p) => p.id === id)
    if (!current) return
    await writePersona({ ...current, ...patch })
  }

  const createPerson = async (draft: Omit<Persona, 'id'>) => {
    const existing = new Set(people.map((p) => p.id))
    const id = uniqueId(`${draft.nombre}-${draft.unidad}`, existing)
    await writePersona({ ...draft, id })
  }

  const deletePerson = async (id: string) => {
    const admin_password = requireAdminPassword()
    const { error: rpcError } = await supabase.rpc('admin_delete_persona', {
      admin_password,
      persona_id: id,
    })
    if (rpcError) throw new Error(friendlyMessage(rpcError.message))
    await load()
  }

  const updateFicha = async (id: string, patch: Partial<FichaTribunal>) => {
    const admin_password = requireAdminPassword()
    const { error: rpcError } = await supabase.rpc('admin_update_ficha', {
      admin_password,
      ficha_id: id,
      patch,
    })
    if (rpcError) throw new Error(friendlyMessage(rpcError.message))
    await load()
  }

  return {
    people,
    tribunales,
    correoGeneralSeccion: directorio.correoGeneralSeccion,
    generatedAt,
    loading,
    error,
    updatePerson,
    createPerson,
    deletePerson,
    updateFicha,
  }
}
