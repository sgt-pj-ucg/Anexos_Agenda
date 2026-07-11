import { useMemo, useState } from 'react'
import { directorio } from './data'
import { useTheme } from './hooks/useTheme'
import { buildSearchIndex } from './lib/search'
import { normalize } from './lib/normalize'
import { isToday } from './lib/cumpleanos'
import { COMUNA_ORDER } from './lib/comunas'
import { buildGroups } from './lib/groups'
import { SECTION_META, type SeccionKey } from './lib/sections'
import type { Persona } from './types'

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

export default function App() {
  const { theme, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const [section, setSection] = useState<SeccionKey>('todos')
  const [comuna, setComuna] = useState<string | null>(null)

  const fuse = useMemo(() => buildSearchIndex(directorio.people), [])

  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: directorio.people.length }
    for (const p of directorio.people) counts[p.seccion] = (counts[p.seccion] ?? 0) + 1
    return counts
  }, [])

  const comunaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of directorio.people) {
      if (p.seccion === 'tribunal' && p.comuna) counts[p.comuna] = (counts[p.comuna] ?? 0) + 1
    }
    return counts
  }, [])

  const comunasDisponibles = useMemo(
    () => COMUNA_ORDER.filter((c) => comunaCounts[c] > 0),
    [comunaCounts],
  )

  const birthdayPeople = useMemo(() => directorio.people.filter((p) => isToday(p.cumpleanos)), [])

  const trimmedQuery = query.trim()

  const baseResults: Persona[] = useMemo(() => {
    if (!trimmedQuery) return directorio.people
    const q = normalize(trimmedQuery)
    return fuse.search(q, { limit: 300 }).map((r) => r.item)
  }, [trimmedQuery, fuse])

  const filteredResults = useMemo(() => {
    let results = baseResults
    if (section !== 'todos') results = results.filter((p) => p.seccion === section)
    if (section === 'tribunal' && comuna) results = results.filter((p) => p.comuna === comuna)
    return results
  }, [baseResults, section, comuna])

  const showOverview = section === 'todos' && !trimmedQuery
  const showComunaChips = section === 'tribunal' && comunasDisponibles.length > 1

  const generalEmail = section !== 'todos' ? directorio.correoGeneralSeccion[section] : undefined

  const groups = useMemo(() => {
    if (showOverview || trimmedQuery) return []
    return buildGroups(section, filteredResults)
  }, [showOverview, trimmedQuery, section, filteredResults])

  const handleSelectSection = (s: SeccionKey) => {
    setSection(s)
    setComuna(null)
  }

  return (
    <div className="min-h-screen">
      <Header
        theme={theme}
        onToggleTheme={toggle}
        totalPersonas={directorio.totalPersonas}
        totalTribunales={directorio.tribunales.length}
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
          <SectionOverview counts={sectionCounts} onSelect={handleSelectSection} />
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
              <FlatResults people={filteredResults} />
            ) : (
              <GroupedResults groups={groups} collapsible={section === 'tribunal'} />
            )}
          </>
        )}
      </main>

      <Footer generatedAt={directorio.generatedAt} />
    </div>
  )
}
