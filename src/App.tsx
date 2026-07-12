import { useMemo, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { useDirectorioData } from './hooks/useDirectorioData'
import { buildSearchIndex, searchPeople } from './lib/search'
import { isToday } from './lib/cumpleanos'
import { COMUNA_ORDER } from './lib/comunas'
import { buildGroups } from './lib/groups'
import { SECTION_META, type SeccionKey } from './lib/sections'
import type { FichaTribunal, Persona } from './types'
import type { Group } from './components/GroupedResults'
import type { PersonFormValues } from './components/PersonEditModal'
import type { TribunalFormValues } from './components/TribunalEditModal'

import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { SectionTabs } from './components/SectionTabs'
import { ComunaChips } from './components/ComunaChips'
import { BirthdayBanner } from './components/BirthdayBanner'
import { GeneralEmailBanner } from './components/GeneralEmailBanner'
import { SectionOverview } from './components/SectionOverview'
import { GroupedResults } from './components/GroupedResults'
import { FlatResults } from './components/FlatResults'
import { EmptyState } from './components/EmptyState'
import { Footer } from './components/Footer'
import { PersonEditModal } from './components/PersonEditModal'
import { TribunalEditModal } from './components/TribunalEditModal'

type ModalState = { mode: 'edit'; person: Persona } | { mode: 'add'; group: Group } | null

export default function App() {
  const { theme, toggle } = useTheme()
  const {
    people,
    tribunales,
    correoGeneralSeccion,
    generatedAt,
    updatePerson,
    createPerson,
    deletePerson,
    updateFicha,
    exportData,
    resetChanges,
    hasChanges,
  } = useDirectorioData()

  const [query, setQuery] = useState('')
  const [section, setSection] = useState<SeccionKey>('todos')
  const [comuna, setComuna] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [fichaModal, setFichaModal] = useState<FichaTribunal | null>(null)

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

  const filteredResults = useMemo(() => {
    let results = baseResults
    if (section !== 'todos') results = results.filter((p) => p.seccion === section)
    if (section === 'tribunal' && comuna) results = results.filter((p) => p.comuna === comuna)
    return results
  }, [baseResults, section, comuna])

  const showOverview = section === 'todos' && !trimmedQuery
  const showComunaChips = section === 'tribunal' && comunasDisponibles.length > 1

  const generalEmail = section !== 'todos' ? correoGeneralSeccion[section] : undefined

  const groups = useMemo(() => {
    if (showOverview || trimmedQuery) return []
    return buildGroups(section, filteredResults, tribunales)
  }, [showOverview, trimmedQuery, section, filteredResults, tribunales])

  const handleSelectSection = (s: SeccionKey) => {
    setSection(s)
    setComuna(null)
  }

  const handleDelete = (p: Persona) => {
    if (window.confirm(`¿Eliminar a ${p.nombre} del directorio?`)) deletePerson(p.id)
  }

  const handleSubmitModal = (values: PersonFormValues) => {
    const correos = values.correos
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const cargo = values.cargo.trim() || null
    const anexo = values.anexo.trim() || null
    const cumpleanos = values.cumpleanos.trim() || null
    const calidadJuridica = values.calidadJuridica.trim() || null

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
      updatePerson(patch, modal.person.id)
    } else if (modal?.mode === 'add') {
      const sample = modal.group.people[0]
      createPerson({
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
        fichaTribunal: modal.group.ficha,
      })
    }
    setModal(null)
  }

  const handleSubmitFicha = (values: TribunalFormValues) => {
    if (!fichaModal) return
    updateFicha(fichaModal.id, {
      ministroVisitador: values.ministroVisitador.trim() || null,
      correo: values.correo.trim() || null,
      telefono: values.telefono.trim() || null,
      competencias: values.competencias
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
    setFichaModal(null)
  }

  return (
    <div className="min-h-screen">
      <Header
        theme={theme}
        onToggleTheme={toggle}
        totalPersonas={people.length}
        totalTribunales={tribunales.length}
        hasChanges={hasChanges}
        onExport={exportData}
        onReset={resetChanges}
      />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <SearchBar value={query} onChange={setQuery} />

        <SectionTabs active={section} onChange={handleSelectSection} counts={sectionCounts} />

        {showComunaChips && (
          <ComunaChips
            comunas={comunasDisponibles}
            active={comuna}
            onChange={setComuna}
            counts={comunaCounts}
          />
        )}

        {birthdayPeople.length > 0 && !trimmedQuery && <BirthdayBanner people={birthdayPeople} />}

        {showOverview ? (
          <SectionOverview
            counts={sectionCounts}
            peopleBySection={peopleBySection}
            onSelect={handleSelectSection}
          />
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredResults.length} {filteredResults.length === 1 ? 'resultado' : 'resultados'}
              {section !== 'todos' && <> en {SECTION_META[section].label}</>}
              {comuna && <> · {comuna}</>}
            </p>

            {generalEmail && !trimmedQuery && <GeneralEmailBanner correo={generalEmail} />}

            {filteredResults.length === 0 ? (
              <EmptyState query={trimmedQuery} />
            ) : trimmedQuery ? (
              <FlatResults
                people={filteredResults}
                onEditPerson={(p) => setModal({ mode: 'edit', person: p })}
                onDeletePerson={handleDelete}
              />
            ) : (
              <GroupedResults
                groups={groups}
                collapsible={section === 'tribunal'}
                onEditPerson={(p) => setModal({ mode: 'edit', person: p })}
                onDeletePerson={handleDelete}
                onAddPerson={(g) => setModal({ mode: 'add', group: g })}
                onEditFicha={setFichaModal}
              />
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
    </div>
  )
}
