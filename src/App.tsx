import { useMemo, useState } from 'react'
import { BookOpenText, BookUser, Briefcase, Landmark, Scale, UserCog, Users, Workflow } from 'lucide-react'
import { useTheme } from './hooks/useTheme'
import { useDirectorioData } from './hooks/useDirectorioData'
import { useFavorites } from './hooks/useFavorites'
import { useIsAdmin } from './context/RoleContext'
import { buildSearchIndex, searchPeople } from './lib/search'
import { isToday } from './lib/cumpleanos'
import { COMUNA_ORDER } from './lib/comunas'
import { MATERIA_ORDER } from './lib/materias'
import { normalize } from './lib/normalize'
import {
  collectGroupContacts,
  esAbogadoIntegrante,
  esFiscalia,
  esFuncionarioCorte,
  esMinistroOPresidencia,
  esRelator,
} from './lib/mailto'
import { buildGroups } from './lib/groups'
import { getLastSeen, markSeen } from './lib/novedades'
import { SECTION_META, perteneceASeccionCorte, type SeccionKey } from './lib/sections'
import type { CategoriaExterna, ContactoExterno, FichaTribunal, Persona } from './types'
import { CATEGORIA_META, CATEGORIA_ORDER } from './lib/contactosExternos'
import type { Group } from './components/GroupedResults'
import type { PersonFormValues } from './components/PersonEditModal'
import type { TribunalFormValues } from './components/TribunalEditModal'
import type { ContactoExternoFormValues } from './components/ContactoExternoEditModal'

import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { FavoritesToggle } from './components/FavoritesToggle'
import { SectionTabs } from './components/SectionTabs'
import { ComunaChips } from './components/ComunaChips'
import { MateriaChips } from './components/MateriaChips'
import { TribunalesEmailBanner } from './components/TribunalesEmailBanner'
import { CorteMailGroupsRow, type CorteMailGroup } from './components/CorteMailGroupsRow'
import { FuncionariosCorteModal, type FuncionariosCorteGrupo } from './components/FuncionariosCorteModal'
import { BirthdayBanner } from './components/BirthdayBanner'
import { GeneralEmailBanner } from './components/GeneralEmailBanner'
import { SectionOverview } from './components/SectionOverview'
import { GroupedResults } from './components/GroupedResults'
import { FlatResults } from './components/FlatResults'
import { EmptyState } from './components/EmptyState'
import { Footer } from './components/Footer'
import { PersonEditModal } from './components/PersonEditModal'
import { TribunalEditModal } from './components/TribunalEditModal'
import { ReportIssueModal } from './components/ReportIssueModal'
import { NovedadesPanel } from './components/NovedadesPanel'
import { ReportesPanel } from './components/ReportesPanel'
import { OrganigramaBoard } from './components/OrganigramaBoard'
import { TribunalContactosView } from './components/TribunalContactosView'
import { ContactosExternosView } from './components/ContactosExternosView'
import { ContactoExternoPickerModal } from './components/ContactoExternoPickerModal'
import { ContactoExternoEditModal } from './components/ContactoExternoEditModal'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { VigenciaAlertBanner } from './components/VigenciaAlertBanner'

type ModalState = { mode: 'edit'; person: Persona } | { mode: 'add'; group: Group } | null
type ContactoExternoModalState =
  | { mode: 'edit'; contacto: ContactoExterno }
  | { mode: 'add'; categoria: CategoriaExterna }
  | null
type ReportTarget = { subject: string; contexto: string[] } | null

export default function App() {
  const { theme, toggle } = useTheme()
  const {
    people,
    tribunales,
    cambios,
    reportes,
    contactosExternos,
    correoGeneralSeccion,
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
  } = useDirectorioData()
  const { favorites, toggle: toggleFavorite } = useFavorites()
  const isAdmin = useIsAdmin()

  const [query, setQuery] = useState('')
  const [section, setSection] = useState<SeccionKey>('todos')
  const [comuna, setComuna] = useState<string | null>(null)
  const [materia, setMateria] = useState<string | null>(null)
  const [favoritesMode, setFavoritesMode] = useState(false)
  const [organigramaMode, setOrganigramaMode] = useState(false)
  const [contactosMode, setContactosMode] = useState(false)
  const [externosMode, setExternosMode] = useState(false)
  const [externosPickerOpen, setExternosPickerOpen] = useState(false)
  const [categoriaExterna, setCategoriaExterna] = useState<CategoriaExterna>(CATEGORIA_ORDER[0])
  const [modal, setModal] = useState<ModalState>(null)
  const [fichaModal, setFichaModal] = useState<FichaTribunal | null>(null)
  const [reportTarget, setReportTarget] = useState<ReportTarget>(null)
  const [novedadesOpen, setNovedadesOpen] = useState(false)
  const [reportesOpen, setReportesOpen] = useState(false)
  const [funcionariosModalOpen, setFuncionariosModalOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(() => getLastSeen())

  const searchIndex = useMemo(() => buildSearchIndex(people), [people])

  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: people.length }
    for (const p of people) counts[p.seccion] = (counts[p.seccion] ?? 0) + 1
    // La Unidad de Insolvencia también se lista dentro de Corte de
    // Apelaciones (ver perteneceASeccionCorte), sin dejar de contarse en su
    // propia pestaña.
    counts.corte = (counts.corte ?? 0) + (counts.insolvencia ?? 0)
    return counts
  }, [people])

  const externosCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of contactosExternos) counts[c.categoria] = (counts[c.categoria] ?? 0) + 1
    return counts
  }, [contactosExternos])

  const comunaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of people) {
      if (p.seccion === 'tribunal' && p.comuna) counts[p.comuna] = (counts[p.comuna] ?? 0) + 1
    }
    return counts
  }, [people])

  const comunasDisponibles = useMemo(
    () => COMUNA_ORDER.filter((c) => comunaCounts[c] > 0),
    [comunaCounts],
  )

  const fichaByUnidad = useMemo(
    () => new Map(tribunales.map((t) => [normalize(t.nombre), t])),
    [tribunales],
  )

  const materiaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tribunales) {
      for (const c of t.competencias) counts[c] = (counts[c] ?? 0) + 1
    }
    return counts
  }, [tribunales])

  const materiasDisponibles = useMemo(
    () => MATERIA_ORDER.filter((m) => materiaCounts[m] > 0),
    [materiaCounts],
  )

  const birthdayPeople = useMemo(() => people.filter((p) => isToday(p.cumpleanos)), [people])

  const peopleBySection = useMemo(() => {
    const map: Partial<Record<SeccionKey, Persona[]>> = {}
    for (const p of people) {
      if (p.seccion === 'tribunal') continue
      ;(map[p.seccion] ??= []).push(p)
    }
    return map
  }, [people])

  const trimmedQuery = query.trim()

  const baseResults: Persona[] = useMemo(() => {
    if (!trimmedQuery) return people
    return searchPeople(searchIndex, trimmedQuery)
  }, [trimmedQuery, searchIndex, people])

  const favoritePeople = useMemo(() => people.filter((p) => favorites.has(p.id)), [people, favorites])

  const favoriteIndex = useMemo(() => buildSearchIndex(favoritePeople), [favoritePeople])

  const favoriteResults = useMemo(() => {
    if (!trimmedQuery) return favoritePeople
    return searchPeople(favoriteIndex, trimmedQuery)
  }, [trimmedQuery, favoriteIndex, favoritePeople])

  const novedadesCount = useMemo(() => {
    if (!lastSeen) return cambios.length
    return cambios.filter((c) => c.createdAt > lastSeen).length
  }, [cambios, lastSeen])

  const reportesCount = useMemo(
    () => reportes.filter((r) => r.estado === 'pendiente').length,
    [reportes],
  )

  const filteredResults = useMemo(() => {
    let results = baseResults
    if (section !== 'todos') {
      results = results.filter((p) =>
        section === 'corte' ? perteneceASeccionCorte(p.seccion) : p.seccion === section,
      )
    }
    if (section === 'tribunal' && comuna) results = results.filter((p) => p.comuna === comuna)
    if (section === 'tribunal' && materia) {
      results = results.filter((p) => fichaByUnidad.get(normalize(p.unidad))?.competencias.includes(materia))
    }
    return results
  }, [baseResults, section, comuna, materia, fichaByUnidad])

  const showOverview = section === 'todos' && !trimmedQuery
  const showComunaChips = section === 'tribunal' && comunasDisponibles.length > 1
  const showMateriaChips = section === 'tribunal' && materiasDisponibles.length > 1

  const generalEmail = section !== 'todos' ? correoGeneralSeccion[section] : undefined

  const corteCategorias = useMemo(() => {
    if (section !== 'corte') return []
    return [
      { id: 'funcionarios', icon: Users, label: 'Funcionarios', tone: 'violet' as const, contactos: collectGroupContacts(people.filter(esFuncionarioCorte)) },
      { id: 'ministros', icon: Landmark, label: 'Ministros y Presidencia', tone: 'indigo' as const, contactos: collectGroupContacts(people.filter(esMinistroOPresidencia)) },
      { id: 'fiscalias', icon: Scale, label: 'Fiscalías', tone: 'rose' as const, contactos: collectGroupContacts(people.filter(esFiscalia)) },
      { id: 'relatores', icon: BookOpenText, label: 'Relatores', tone: 'sky' as const, contactos: collectGroupContacts(people.filter(esRelator)) },
      { id: 'abogados', icon: Briefcase, label: 'Abogados Integrantes', tone: 'amber' as const, contactos: collectGroupContacts(people.filter(esAbogadoIntegrante)) },
    ]
  }, [section, people])

  const corteMailGroups: CorteMailGroup[] = useMemo(
    () =>
      corteCategorias.map((g) => ({
        id: g.id,
        icon: g.icon,
        label: g.label,
        tone: g.tone,
        correos: g.contactos.map((c) => c.correo),
      })),
    [corteCategorias],
  )

  const funcionariosCorteGrupos: FuncionariosCorteGrupo[] = useMemo(
    () =>
      corteCategorias
        .map((g) => ({ id: g.id, label: g.label, contactos: g.contactos }))
        .filter((g) => g.contactos.length > 0),
    [corteCategorias],
  )

  const todosFuncionariosCorteTotal = useMemo(
    () => funcionariosCorteGrupos.reduce((sum, g) => sum + g.contactos.length, 0),
    [funcionariosCorteGrupos],
  )

  const groups = useMemo(() => {
    if (showOverview || trimmedQuery) return []
    return buildGroups(section, filteredResults, tribunales)
  }, [showOverview, trimmedQuery, section, filteredResults, tribunales])

  const tribunalesEmails = useMemo(() => {
    if (section !== 'tribunal') return []
    const emails = new Set<string>()
    for (const g of groups) {
      if (g.ficha?.correo) emails.add(g.ficha.correo)
    }
    return Array.from(emails).sort((a, b) => a.localeCompare(b, 'es'))
  }, [section, groups])

  const tribunalesEmailSuffix = [materia, comuna].filter(Boolean).join(' · ')

  const cortePeople = useMemo(() => people.filter((p) => perteneceASeccionCorte(p.seccion)), [people])

  // Para el selector "Trasladar a" del modal de edición: unidades ya
  // existentes en Corte/Insolvencia (para saber a qué sección pertenece
  // cada una al reconstruir el traslado) y el mapa por nombre de unidad.
  const corteUnidadSeccion = useMemo(() => {
    const map = new Map<string, Persona['seccion']>()
    for (const p of cortePeople) {
      if (!map.has(p.unidad)) map.set(p.unidad, p.seccion)
    }
    return map
  }, [cortePeople])

  const corteUnidades = useMemo(
    () => Array.from(corteUnidadSeccion.keys()).sort((a, b) => a.localeCompare(b, 'es')),
    [corteUnidadSeccion],
  )

  const handleSelectSection = (s: SeccionKey) => {
    setSection(s)
    setComuna(null)
    setMateria(null)
    setFavoritesMode(false)
    setOrganigramaMode(false)
    setContactosMode(false)
    setExternosMode(false)
  }

  const handleMoveUnidad = async (personId: string, nuevaUnidad: string) => {
    await updatePerson({ unidad: nuevaUnidad }, personId)
  }

  const openReport = (subject: string, contexto: string[]) => setReportTarget({ subject, contexto })

  const handleReportSubmit = async (descripcion: string) => {
    if (!reportTarget) return
    await submitReport(reportTarget.subject, reportTarget.contexto.filter(Boolean).join(' · '), descripcion)
  }

  const handleSetReporteEstado = async (id: number, estado: 'pendiente' | 'resuelto') => {
    try {
      await setReporteEstado(id, estado)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo actualizar el reporte.')
    }
  }

  const openNovedades = () => {
    setNovedadesOpen(true)
    const latest = cambios[0]?.createdAt
    if (latest) {
      markSeen(latest)
      setLastSeen(latest)
    }
  }

  const [deleteTarget, setDeleteTarget] = useState<Persona | null>(null)
  const [contactoExternoModal, setContactoExternoModal] = useState<ContactoExternoModalState>(null)
  const [deleteExternoTarget, setDeleteExternoTarget] = useState<ContactoExterno | null>(null)

  const handleSubmitContactoExterno = async (values: ContactoExternoFormValues) => {
    if (!contactoExternoModal) return
    const patch = {
      institucion: values.institucion.trim() || null,
      nombre: values.nombre.trim() || null,
      cargo: values.cargo.trim() || null,
      comuna: values.comuna.trim() || null,
      correos: values.correos
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      telefonos: values.telefonos
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      direccion: values.direccion.trim() || null,
      calidadJuridica: values.calidadJuridica.trim() || null,
      observaciones: values.observaciones.trim() || null,
      vigenciaDesde: values.vigenciaDesde.trim() || null,
      vigenciaHasta: values.vigenciaHasta.trim() || null,
    }
    try {
      if (contactoExternoModal.mode === 'edit') {
        await updateContactoExterno(contactoExternoModal.contacto.id, {
          ...patch,
          categoria: contactoExternoModal.contacto.categoria,
        })
      } else {
        await createContactoExterno({ ...patch, categoria: contactoExternoModal.categoria })
      }
      setContactoExternoModal(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo guardar el contacto externo.')
    }
  }

  const handleVacateExterno = async () => {
    if (!deleteExternoTarget) return
    try {
      await updateContactoExterno(deleteExternoTarget.id, {
        nombre: '(Cargo vacante)',
        cargo: null,
        correos: [],
        telefonos: [],
        calidadJuridica: null,
        observaciones: null,
        vigenciaDesde: null,
        vigenciaHasta: null,
      })
      setDeleteExternoTarget(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo dejar el cargo vacante.')
    }
  }

  const handleDeleteExternoForever = async () => {
    if (!deleteExternoTarget) return
    try {
      await deleteContactoExterno(deleteExternoTarget.id)
      setDeleteExternoTarget(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo eliminar el contacto.')
    }
  }

  const handleVacate = async () => {
    if (!deleteTarget) return
    try {
      await updatePerson(
        {
          nombre: '(Cargo vacante)',
          cargo: null,
          correos: [],
          cumpleanos: null,
          calidadJuridica: null,
          suplente: null,
          vacante: true,
          vigenciaDesde: null,
          vigenciaHasta: null,
        },
        deleteTarget.id,
      )
      setDeleteTarget(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo dejar el cargo vacante.')
    }
  }

  const handleDeleteForever = async () => {
    if (!deleteTarget) return
    try {
      await deletePerson(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo eliminar el contacto.')
    }
  }

  const handleSubmitModal = async (values: PersonFormValues) => {
    const correos = values.correos
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const cargo = values.cargo.trim() || null
    const anexo = values.anexo.trim() || null
    const cumpleanos = values.cumpleanos.trim() || null
    const calidadJuridica = values.calidadJuridica.trim() || null
    const vigenciaDesde = values.vigenciaDesde.trim() || null
    const vigenciaHasta = values.vigenciaHasta.trim() || null

    try {
      if (modal?.mode === 'edit') {
        const patch: Partial<Persona> = {
          nombre: values.nombre.trim(),
          cargo,
          correos,
          anexo,
          cumpleanos,
          calidadJuridica,
          vigenciaDesde,
          vigenciaHasta,
          esGenerico: values.esGenerico,
        }
        // Al completar el nombre de un cargo vacante, se considera ocupado.
        if (modal.person.vacante) patch.vacante = false

        // "Trasladar a": mueve de un tribunal a otro, o hacia/desde la
        // Corte de Apelaciones, actualizando unidad/tribunal/comuna/sección
        // juntos en un solo paso.
        if (values.destino) {
          const idx = values.destino.indexOf(':')
          const kind = values.destino.slice(0, idx)
          const ref = values.destino.slice(idx + 1)
          if (kind === 'tribunal') {
            const ficha = tribunales.find((t) => t.id === ref)
            if (ficha) {
              patch.seccion = 'tribunal'
              patch.tribunal = ficha.nombre
              patch.unidad = ficha.nombre
              patch.comuna = ficha.comuna
            }
          } else if (kind === 'corte') {
            patch.seccion = corteUnidadSeccion.get(ref) ?? 'corte'
            patch.tribunal = 'Corte de Apelaciones de La Serena'
            patch.unidad = ref
            patch.comuna = 'La Serena'
          }
        }

        await updatePerson(patch, modal.person.id)
      } else if (modal?.mode === 'add') {
        const sample = modal.group.people[0]
        await createPerson({
          nombre: values.nombre.trim(),
          cargo,
          unidad: modal.group.label,
          seccion: sample?.seccion ?? 'corte',
          tribunal: sample?.tribunal ?? null,
          correos,
          anexo,
          cumpleanos,
          grado: null,
          calidadJuridica,
          esGenerico: values.esGenerico,
          comuna: sample?.comuna ?? null,
          vigenciaDesde,
          vigenciaHasta,
        })
      }
      setModal(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo guardar el contacto.')
    }
  }

  const handleSubmitFicha = async (values: TribunalFormValues) => {
    if (!fichaModal) return
    try {
      await updateFicha(fichaModal.id, {
        ministroVisitador: values.ministroVisitador.trim() || null,
        correo: fichaModal.correo,
        telefonos: values.telefonos
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        direccion: values.direccion.trim() || null,
        competencias: values.competencias
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        correoAdminSecretario: values.correoAdminSecretario.trim() || null,
        correoSegundoLider: values.correoSegundoLider.trim() || null,
      })
      setFichaModal(null)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'No se pudo guardar la ficha del tribunal.')
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        theme={theme}
        onToggleTheme={toggle}
        totalPersonas={people.length}
        totalTribunales={tribunales.length}
        novedadesCount={novedadesCount}
        onOpenNovedades={openNovedades}
        reportesCount={reportesCount}
        onOpenReportes={() => setReportesOpen(true)}
      />

      {error && (
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        </div>
      )}

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">
            Cargando directorio…
          </p>
        ) : (
          <>
            <VigenciaAlertBanner people={people} contactosExternos={contactosExternos} />
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder={
                    externosMode
                      ? 'Busca por nombre, institución, comuna, correo o teléfono…'
                      : undefined
                  }
                />
              </div>
              <FavoritesToggle
                active={favoritesMode}
                count={favorites.size}
                onClick={() => {
                  setFavoritesMode((v) => !v)
                  setExternosMode(false)
                }}
              />
            </div>

            {!favoritesMode && (
              <SectionTabs
                active={section}
                onChange={handleSelectSection}
                counts={sectionCounts}
                trailing={
                  <button
                    type="button"
                    onClick={() => {
                      if (externosMode) {
                        setExternosMode(false)
                      } else {
                        setExternosPickerOpen(true)
                      }
                    }}
                    title="Academia Judicial, CBR y Notarías, Cortes del país, Receptores/Procuradores y Policía Local"
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                      externosMode
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-800'
                    }`}
                  >
                    <BookUser size={15} />
                    {externosMode ? 'Ver directorio interno' : 'Externo'}
                  </button>
                }
              />
            )}

            {!favoritesMode && !externosMode && section === 'tribunal' && (
              <button
                type="button"
                onClick={() => {
                  setContactosMode((v) => !v)
                  setOrganigramaMode(false)
                }}
                title="Correo genérico, administrador/secretario y Juez Presidente / Juez de cada tribunal"
                className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  contactosMode
                    ? 'border-indigo-400 bg-indigo-100 text-indigo-800 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <UserCog size={14} />
                {contactosMode ? 'Ver como lista' : 'Tribunales: Admin. y Secretarios'}
              </button>
            )}

            {!favoritesMode && !contactosMode && !externosMode && isAdmin && section === 'corte' && (
              <button
                type="button"
                onClick={() => setOrganigramaMode((v) => !v)}
                className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  organigramaMode
                    ? 'border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Workflow size={14} />
                {organigramaMode ? 'Ver como lista' : 'Reorganizar unidades'}
              </button>
            )}

            {!favoritesMode && !organigramaMode && !contactosMode && !externosMode && showComunaChips && (
              <ComunaChips
                comunas={comunasDisponibles}
                active={comuna}
                onChange={setComuna}
                counts={comunaCounts}
              />
            )}

            {!favoritesMode && !contactosMode && !externosMode && showMateriaChips && (
              <MateriaChips
                materias={materiasDisponibles}
                active={materia}
                onChange={setMateria}
                counts={materiaCounts}
              />
            )}

            {!favoritesMode && !organigramaMode && !contactosMode && !externosMode && birthdayPeople.length > 0 && !trimmedQuery && (
              <BirthdayBanner people={birthdayPeople} />
            )}

            {externosMode ? (
              <ContactosExternosView
                contactos={contactosExternos}
                categoria={categoriaExterna}
                onChangeCategoria={setCategoriaExterna}
                query={trimmedQuery}
                onEditContacto={(c) => setContactoExternoModal({ mode: 'edit', contacto: c })}
                onDeleteContacto={setDeleteExternoTarget}
                onReportContacto={(c) =>
                  openReport(c.nombre ?? c.institucion ?? 'Contacto externo', [c.institucion ?? '', c.cargo ?? ''])
                }
                onAddContacto={(cat) => setContactoExternoModal({ mode: 'add', categoria: cat })}
              />
            ) : contactosMode ? (
              <TribunalContactosView tribunales={tribunales} personas={people} onEditFicha={setFichaModal} />
            ) : organigramaMode ? (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {cortePeople.length} funcionarios de la Corte de Apelaciones
                  {isAdmin && ' — arrastra una tarjeta a otra columna para reasignar de unidad.'}
                </p>
                <OrganigramaBoard people={cortePeople} isAdmin={isAdmin} onMove={handleMoveUnidad} />
              </>
            ) : favoritesMode ? (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {favoriteResults.length}{' '}
                  {favoriteResults.length === 1 ? 'favorito' : 'favoritos'}
                </p>
                {favoriteResults.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-400">
                    Aún no tienes favoritos. Marca la estrella de un contacto para agregarlo aquí.
                  </p>
                ) : (
                  <FlatResults
                    people={favoriteResults}
                    onEditPerson={(p) => setModal({ mode: 'edit', person: p })}
                    onDeletePerson={setDeleteTarget}
                    onReportPerson={(p) => openReport(p.nombre, [p.unidad, p.cargo ?? ''])}
                    isFavorite={(id) => favorites.has(id)}
                    onToggleFavorite={toggleFavorite}
                  />
                )}
              </>
            ) : showOverview ? (
              <SectionOverview
                counts={sectionCounts}
                peopleBySection={peopleBySection}
                onSelect={handleSelectSection}
              />
            ) : (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {filteredResults.length}{' '}
                  {filteredResults.length === 1 ? 'resultado' : 'resultados'}
                  {section !== 'todos' && <> en {SECTION_META[section].label}</>}
                  {comuna && <> · {comuna}</>}
                  {materia && <> · {materia}</>}
                </p>

                {generalEmail && !trimmedQuery && <GeneralEmailBanner correo={generalEmail} />}

                {section === 'corte' && !trimmedQuery && (
                  <CorteMailGroupsRow
                    groups={corteMailGroups}
                    todosCount={todosFuncionariosCorteTotal}
                    onOpenTodos={() => setFuncionariosModalOpen(true)}
                  />
                )}

                {section === 'tribunal' && !trimmedQuery && (
                  <TribunalesEmailBanner suffix={tribunalesEmailSuffix} correos={tribunalesEmails} />
                )}

                {filteredResults.length === 0 ? (
                  <EmptyState query={trimmedQuery} />
                ) : trimmedQuery ? (
                  <FlatResults
                    people={filteredResults}
                    onEditPerson={(p) => setModal({ mode: 'edit', person: p })}
                    onDeletePerson={setDeleteTarget}
                    onReportPerson={(p) => openReport(p.nombre, [p.unidad, p.cargo ?? ''])}
                    isFavorite={(id) => favorites.has(id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ) : (
                  <GroupedResults
                    groups={groups}
                    collapsible={section === 'tribunal'}
                    onEditPerson={(p) => setModal({ mode: 'edit', person: p })}
                    onDeletePerson={setDeleteTarget}
                    onAddPerson={(g) => setModal({ mode: 'add', group: g })}
                    onEditFicha={setFichaModal}
                    onReportPerson={(p) => openReport(p.nombre, [p.unidad, p.cargo ?? ''])}
                    onReportFicha={(f) => openReport(f.nombre, ['Ficha de tribunal'])}
                    isFavorite={(id) => favorites.has(id)}
                    onToggleFavorite={toggleFavorite}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      <Footer generatedAt={generatedAt} />

      {modal && (
        <PersonEditModal
          title={modal.mode === 'edit' ? 'Editar contacto' : 'Agregar contacto'}
          unidad={modal.mode === 'edit' ? modal.person.unidad : modal.group.label}
          initial={modal.mode === 'edit' ? modal.person : undefined}
          tribunales={tribunales}
          corteUnidades={corteUnidades}
          onCancel={() => setModal(null)}
          onSubmit={handleSubmitModal}
        />
      )}

      {externosPickerOpen && (
        <ContactoExternoPickerModal
          counts={externosCounts}
          onClose={() => setExternosPickerOpen(false)}
          onSelect={(categoria) => {
            setCategoriaExterna(categoria)
            setExternosMode(true)
            setExternosPickerOpen(false)
            setOrganigramaMode(false)
            setContactosMode(false)
          }}
        />
      )}

      {contactoExternoModal && (
        <ContactoExternoEditModal
          title={contactoExternoModal.mode === 'edit' ? 'Editar contacto externo' : 'Agregar contacto externo'}
          categoriaLabel={
            CATEGORIA_META[
              contactoExternoModal.mode === 'edit' ? contactoExternoModal.contacto.categoria : contactoExternoModal.categoria
            ].label
          }
          initial={contactoExternoModal.mode === 'edit' ? contactoExternoModal.contacto : undefined}
          onCancel={() => setContactoExternoModal(null)}
          onSubmit={handleSubmitContactoExterno}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          nombre={deleteTarget.nombre}
          onCancel={() => setDeleteTarget(null)}
          onVacate={handleVacate}
          onDeleteForever={handleDeleteForever}
        />
      )}

      {deleteExternoTarget && (
        <DeleteConfirmModal
          nombre={deleteExternoTarget.nombre ?? deleteExternoTarget.institucion ?? 'este contacto'}
          onCancel={() => setDeleteExternoTarget(null)}
          onVacate={handleVacateExterno}
          onDeleteForever={handleDeleteExternoForever}
        />
      )}

      {fichaModal && (
        <TribunalEditModal
          ficha={fichaModal}
          personas={people}
          onCancel={() => setFichaModal(null)}
          onSubmit={handleSubmitFicha}
        />
      )}

      {reportTarget && (
        <ReportIssueModal
          subject={reportTarget.subject}
          contexto={reportTarget.contexto}
          onSubmit={handleReportSubmit}
          onCancel={() => setReportTarget(null)}
        />
      )}

      {novedadesOpen && (
        <NovedadesPanel cambios={cambios} onClose={() => setNovedadesOpen(false)} />
      )}

      {reportesOpen && (
        <ReportesPanel
          reportes={reportes}
          onSetEstado={handleSetReporteEstado}
          onClose={() => setReportesOpen(false)}
        />
      )}

      {funcionariosModalOpen && (
        <FuncionariosCorteModal
          grupos={funcionariosCorteGrupos}
          onClose={() => setFuncionariosModalOpen(false)}
        />
      )}
    </div>
  )
}
