import { useCallback, useEffect, useMemo, useState } from 'react'
import { directorio } from '../data'
import { supabase } from '../lib/supabaseClient'
import { getAdminPassword } from '../lib/auth'
import { slugify } from '../lib/normalize'
import { esVigenciaFutura } from '../lib/vigencia'
import { aplicarCargoTransitorio } from '../lib/cargoTransitorio'
import { useIsAdmin } from '../context/RoleContext'
import type {
  Cambio,
  CategoriaExterna,
  ContactoExterno,
  FichaTribunal,
  Persona,
  Reporte,
  ReporteEstado,
  Seccion,
} from '../types'

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
  vigencia_desde: string | null
  vigencia_hasta: string | null
  cargo_transitorio: string | null
  tribunal_transitorio: string | null
  unidad_transitorio: string | null
  seccion_transitorio: Seccion | null
  comuna_transitorio: string | null
  transitorio_desde: string | null
  transitorio_hasta: string | null
  orden: number
  updated_at: string
}

interface TribunalRow {
  id: string
  nombre: string
  correo: string | null
  telefonos: string[] | null
  direccion: string | null
  ministro_visitador: string | null
  competencias: string[] | null
  comuna: string | null
  correo_admin_secretario: string | null
  correo_segundo_lider: string | null
  updated_at: string
}

interface ContactoExternoRow {
  id: string
  categoria: CategoriaExterna
  institucion: string | null
  nombre: string | null
  cargo: string | null
  comuna: string | null
  correos: string[] | null
  telefonos: string[] | null
  direccion: string | null
  calidad_juridica: string | null
  observaciones: string | null
  vigencia_desde: string | null
  vigencia_hasta: string | null
  orden: number
}

interface CambioRow {
  id: number
  created_at: string
  tipo: Cambio['tipo']
  entidad: string
  detalle: string | null
  admin_nombre: string | null
}

interface ReporteRow {
  id: number
  created_at: string
  entidad: string
  contexto: string | null
  descripcion: string
  estado: ReporteEstado
  resolved_at: string | null
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
    vigenciaDesde: row.vigencia_desde,
    vigenciaHasta: row.vigencia_hasta,
    cargoTransitorio: row.cargo_transitorio,
    tribunalTransitorio: row.tribunal_transitorio,
    unidadTransitorio: row.unidad_transitorio,
    seccionTransitorio: row.seccion_transitorio,
    comunaTransitorio: row.comuna_transitorio,
    transitorioDesde: row.transitorio_desde,
    transitorioHasta: row.transitorio_hasta,
  }
}

function rowToFicha(row: TribunalRow): FichaTribunal {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    telefonos: row.telefonos ?? [],
    direccion: row.direccion,
    ministroVisitador: row.ministro_visitador,
    competencias: row.competencias ?? [],
    comuna: row.comuna,
    correoAdminSecretario: row.correo_admin_secretario,
    correoSegundoLider: row.correo_segundo_lider,
  }
}

function rowToContactoExterno(row: ContactoExternoRow): ContactoExterno {
  return {
    id: row.id,
    categoria: row.categoria,
    institucion: row.institucion,
    nombre: row.nombre,
    cargo: row.cargo,
    comuna: row.comuna,
    correos: row.correos ?? [],
    telefonos: row.telefonos ?? [],
    direccion: row.direccion,
    calidadJuridica: row.calidad_juridica,
    observaciones: row.observaciones,
    vigenciaDesde: row.vigencia_desde,
    vigenciaHasta: row.vigencia_hasta,
    orden: row.orden,
  }
}

function rowToCambio(row: CambioRow): Cambio {
  return {
    id: row.id,
    createdAt: row.created_at,
    tipo: row.tipo,
    entidad: row.entidad,
    detalle: row.detalle,
    adminNombre: row.admin_nombre,
  }
}

function rowToReporte(row: ReporteRow): Reporte {
  return {
    id: row.id,
    createdAt: row.created_at,
    entidad: row.entidad,
    contexto: row.contexto,
    descripcion: row.descripcion,
    estado: row.estado,
    resolvedAt: row.resolved_at,
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
  const isAdmin = useIsAdmin()
  const [peopleRaw, setPeople] = useState<Persona[]>([])
  const [tribunales, setTribunales] = useState<FichaTribunal[]>([])
  const [cambios, setCambios] = useState<Cambio[]>([])
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [contactosExternos, setContactosExternos] = useState<ContactoExterno[]>([])
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

  const loadCambios = useCallback(async () => {
    // No es un dato crítico: si la tabla "cambios" aún no existe (proyectos
    // que no han corrido la migración del panel de novedades), simplemente
    // se deja la lista vacía en lugar de romper el resto de la app.
    const { data, error: cambiosError } = await supabase
      .from('cambios')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (cambiosError) return
    setCambios(((data ?? []) as CambioRow[]).map(rowToCambio))
  }, [])

  const loadContactosExternos = useCallback(async () => {
    // Igual que "cambios": si la tabla aún no existe (no se ha corrido la
    // migración de contactos externos), se deja la lista vacía sin romper
    // el resto de la app.
    const { data, error: contactosError } = await supabase
      .from('contactos_externos')
      .select('*')
      .order('orden', { ascending: true })
    if (contactosError) return
    setContactosExternos(((data ?? []) as ContactoExternoRow[]).map(rowToContactoExterno))
  }, [])

  const loadReportes = useCallback(async () => {
    // Igual que "cambios": si la tabla aún no existe (no se ha corrido la
    // migración de reportes), se deja la lista vacía sin romper la app.
    const { data, error: reportesError } = await supabase
      .from('reportes')
      .select('*')
      .order('created_at', { ascending: false })
    if (reportesError) return
    setReportes(((data ?? []) as ReporteRow[]).map(rowToReporte))
  }, [])

  useEffect(() => {
    load()
    loadCambios()
    loadContactosExternos()
    if (isAdmin) loadReportes()

    const channel = supabase
      .channel('directorio-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personas' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tribunales' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cambios' }, () => loadCambios())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contactos_externos' }, () =>
        loadContactosExternos(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, () => {
        if (isAdmin) loadReportes()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load, loadCambios, loadContactosExternos, loadReportes, isAdmin])

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
    const current = peopleRaw.find((p) => p.id === id)
    if (!current) return
    await writePersona({ ...current, ...patch })
  }

  const createPerson = async (draft: Omit<Persona, 'id'>) => {
    const existing = new Set(peopleRaw.map((p) => p.id))
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

  const updateContactoExterno = async (id: string, patch: Partial<ContactoExterno>) => {
    const admin_password = requireAdminPassword()
    // Se envía el objeto completo (fusionando con el actual), igual que con
    // "personas": así un patch parcial (por ejemplo, al dejar el cargo
    // vacante) no borra los campos que no menciona, como institución o
    // categoría.
    const current = contactosExternos.find((c) => c.id === id)
    const merged = current ? { ...current, ...patch } : patch
    const { error: rpcError } = await supabase.rpc('admin_update_contacto_externo', {
      admin_password,
      contacto_id: id,
      patch: merged,
    })
    if (rpcError) throw new Error(friendlyMessage(rpcError.message))
    await loadContactosExternos()
  }

  const createContactoExterno = async (draft: Omit<ContactoExterno, 'id' | 'orden'>) => {
    const existing = new Set(contactosExternos.map((c) => c.id))
    const id = uniqueId(`${draft.categoria}-${draft.nombre ?? draft.institucion ?? 'contacto'}`, existing)
    await updateContactoExterno(id, draft)
  }

  const deleteContactoExterno = async (id: string) => {
    const admin_password = requireAdminPassword()
    const { error: rpcError } = await supabase.rpc('admin_delete_contacto_externo', {
      admin_password,
      contacto_id: id,
    })
    if (rpcError) throw new Error(friendlyMessage(rpcError.message))
    await loadContactosExternos()
  }

  const submitReport = async (entidad: string, contexto: string, descripcion: string) => {
    const { error: insertError } = await supabase
      .from('reportes')
      .insert({ entidad, contexto, descripcion })
    if (insertError) throw new Error(friendlyMessage(insertError.message))
    // Refresco inmediato para quien reporta si además es administrador (ya
    // ve la bandeja de reportes); el resto de sesiones se actualiza sola
    // por tiempo real cuando llegue el evento de Postgres.
    if (isAdmin) await loadReportes()
  }

  const setReporteEstado = async (id: number, estado: ReporteEstado) => {
    const admin_password = requireAdminPassword()
    const { error: rpcError } = await supabase.rpc('admin_set_reporte_estado', {
      admin_password,
      reporte_id: id,
      nuevo_estado: estado,
    })
    if (rpcError) throw new Error(friendlyMessage(rpcError.message))
    await loadReportes()
  }

  // Mientras un cargo transitorio está vigente, la persona se muestra en su
  // tribunal/unidad de destino (buscador, grupos, organigrama, correo
  // masivo); el registro guardado (peopleOrigen) nunca se toca, así que el
  // regreso al tribunal de origen al vencer es automático.
  const peopleConComision = useMemo(() => peopleRaw.map(aplicarCargoTransitorio), [peopleRaw])

  // Un cargo cargado con "vigente desde" en el futuro (por proactividad,
  // antes de que empiece su período) solo lo ven los administradores; para
  // el resto queda invisible en todo el directorio hasta que llegue esa
  // fecha.
  const people = useMemo(
    () => (isAdmin ? peopleConComision : peopleConComision.filter((p) => !esVigenciaFutura(p.vigenciaDesde))),
    [peopleConComision, isAdmin],
  )

  return {
    people,
    // Datos oficiales sin la superposición del cargo transitorio: los usa el
    // formulario de edición para mostrar siempre el cargo/tribunal titular
    // en la primera sección, aunque la persona esté hoy en comisión.
    peopleOrigen: peopleRaw,
    tribunales,
    cambios,
    reportes,
    contactosExternos,
    correoGeneralSeccion: directorio.correoGeneralSeccion,
    generatedAt,
    loading,
    error,
    updatePerson,
    createPerson,
    deletePerson,
    updateFicha,
    createContactoExterno,
    updateContactoExterno,
    deleteContactoExterno,
    submitReport,
    setReporteEstado,
  }
}
