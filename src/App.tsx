import { useMemo, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { useDirectorioData } from './hooks/useDirectorioData'
import { useFavorites } from './hooks/useFavorites'
import { buildSearchIndex, searchPeople } from './lib/search'
import { isToday } from './lib/cumpleanos'
import { COMUNA_ORDER } from './lib/comunas'
import { MATERIA_ORDER } from './lib/materias'
import { normalize } from './lib/normalize'
import { buildGroups } from './lib/groups'
import { getLastSeen, markSeen } from './lib/novedades'
import { SECTION_META, type SeccionKey } from './lib/sections'
import type { FichaTribunal, Persona } from './types'
import type { Group } from './components/GroupedResults'
import type { PersonFormValues } from './components/PersonEditModal'
import type { TribunalFormValues } from './components/TribunalEditModal'

import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { FavoritesToggle } from './components/FavoritesToggle'
import { SectionTabs } from './components/SectionTabs'
import { ComunaChips } from './components/ComunaChips'
import { MateriaChips } from './components/MateriaChips'
import { TribunalesEmailBanner } from './components/TribunalesEmailBanner'
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

type ModalState = { mode: 'edit'; person: Persona } | { mode: 'add'; group: Group } | null
type ReportTarget = { subject: string; contexto: string[] } | null

export default function App() {
  const { theme, toggle } = useTheme()
  const {
    people,
    tribunales,
    cambios,
    reportes,
    correoGeneralSeccion,
    generatedAt,
    loading,
    error,
    updatePerson,
    createPerson,
    deletePerson,
    updateFicha,
    submitReport,
    setReporteEstado,
  } = useDirectorioData()
  const { favorites, toggle: toggleFavorite } = useFavorites()

  const [query, setQuery] = useState('')
  const [section, setSection] = useState<SeccionKey>('todos')
  const [comuna, setComuna] = useState<string | null>(null)
  const [materia, setMateria] = useState<string | null>(null)
  const [favoritesMode, setFavoritesMode] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const [fichaModal, setFichaModal] = useState<FichaTribunal | null>(null)
  const [reportTarget, setReportTarget] = useState<ReportTarget>(null)
  const [novedadesOpen, setNovedadesOpen] = useState(false)
  const [reportesOpen, setReportesOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(() => getLastSeen())

  const searchIndex = useMemo(() => buildSearchIndex(people), [people])

  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: people.length }
    for (const p of people) counts[p.seccion] = (counts[p.seccion] ?? 0) + 1
    return counts
  }, [people])

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
    if (section !== 'todos') results = results.filter((p) => p.seccion === section)
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

  const handleSelectSection = (s: SeccionKey) => {
    setSection(s)
    setComuna(null)
    setMateria(null)
    setFavoritesMode(false)
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

  const handleDelete = async (p: Persona) => {
    if (!window.confirm(`¿Eliminar a ${p.nombre} del directorio?`)) return
    try {
      await deletePerson(p.id)
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

    try {
      if (modal?.mode === 'edit') {
        const patch: Partial<Persona> = {
          nombre: values.nombre.trim(),
          cargo,
          correos,
          anexo,
          cumpleanos,
          calidadJuridica,
        }
        // Al completar el nombre de un cargo vacante, se considera ocupado.
        if (modal.person.vacante) patch.vacante = false
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
          esGenerico: false,
          comuna: sample?.comuna ?? null,
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
        correo: values.correo.trim() || null,
        telefono: values.telefono.trim() || null,
        competencias: values.competencias
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
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
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Cargando directorio…
          </p>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <SearchBar value={query} onChange={setQuery} />
              </div>
              <FavoritesToggle
                active={favoritesMode}
                count={favorites.size}
                onClick={() => setFavoritesMode((v) => !v)}
              />
            </div>

            {!favoritesMode && (
              <SectionTabs active={section} onChange={handleSelectSection} counts={sectionCounts} />
            )}

            {!favoritesMode && showComunaChips && (
              <ComunaChips
                comunas={comunasDisponibles}
                active={comuna}
                onChange={setComuna}
                counts={comunaCounts}
              />
            )}

            {!favoritesMode && showMateriaChips && (
              <MateriaChips
                materias={materiasDisponibles}
                active={materia}
                onChange={setMateria}
                counts={materiaCounts}
              />
            )}

            {!favoritesMode && birthdayPeople.length > 0 && !trimmedQuery && (
              <BirthdayBanner people={birthdayPeople} />
            )}

            {favoritesMode ? (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {favoriteResults.length}{' '}
                  {favoriteResults.length === 1 ? 'favorito' : 'favoritos'}
                </p>
                {favoriteResults.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    Aún no tienes favoritos. Marca la estrella de un contacto para agregarlo aquí.
                  </p>
                ) : (
                  <FlatResults
                    people={favoriteResults}
                    onEditPerson={(p) => setModal({ mode: 'edit', person: p })}
                    onDeletePerson={handleDelete}
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
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {filteredResults.length}{' '}
                  {filteredResults.length === 1 ? 'resultado' : 'resultados'}
                  {section !== 'todos' && <> en {SECTION_META[section].label}</>}
                  {comuna && <> · {comuna}</>}
                  {materia && <> · {materia}</>}
                </p>

                {generalEmail && !trimmedQuery && <GeneralEmailBanner correo={generalEmail} />}

                {section === 'tribunal' && !trimmedQuery && (
                  <TribunalesEmailBanner suffix={tribunalesEmailSuffix} correos={tribunalesEmails} />
                )}

                {filteredResults.length === 0 ? (
                  <EmptyState query={trimmedQuery} />
                ) : trimmedQuery ? (
                  <FlatResults
                    people={filteredResults}
                    onEditPerson={(p) => setModal({ mode: 'edit', person: p })}
                    onDeletePerson={handleDelete}
                    onReportPerson={(p) => openReport(p.nombre, [p.unidad, p.cargo ?? ''])}
                    isFavorite={(id) => favorites.has(id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ) : (
                  <GroupedResults
                    groups={groups}
                    collapsible={section === 'tribunal'}
                    onEditPerson={(p) => setModal({ mode: 'edit', person: p })}
                    onDeletePerson={handleDelete}
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
          onCancel={() => setModal(null)}
          onSubmit={handleSubmitModal}
        />
      )}

      {fichaModal && (
        <TribunalEditModal
          ficha={fichaModal}
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
    </div>
  )
}
