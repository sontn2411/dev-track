import React, { memo, useState, useMemo } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { ScanMetrics } from './ScanMetrics'
import { ScanFilterBar } from './ScanFilterBar'
import { ScannedProjectCard } from './ScannedProjectCard'

export const ScanResults: React.FC = memo(() => {
  const rootFolders = useProjectStore((s) => s.rootFolders)
  const scannedProjects = useProjectStore((s) => s.scannedProjects)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')

  // Filter scanned projects by search & language
  const filteredProjects = useMemo(() => {
    return scannedProjects.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.frameworks.some((f) =>
          f.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        p.primary_language.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLang =
        selectedLanguage === 'all' ||
        p.primary_language.toLowerCase() === selectedLanguage.toLowerCase()

      return matchesSearch && matchesLang
    })
  }, [scannedProjects, searchQuery, selectedLanguage])

  // Get distinct languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>()
    scannedProjects.forEach((p) => {
      if (p.primary_language && p.primary_language !== 'Unknown') {
        langs.add(p.primary_language)
      }
    })
    return Array.from(langs).sort()
  }, [scannedProjects])

  if (rootFolders.length === 0 || scannedProjects.length === 0) return null

  return (
    <div className='flex flex-col gap-4'>
      {/* 1. Summary Metrics */}
      <ScanMetrics />

      {/* 2. Search & Language Filter */}
      <ScanFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableLanguages={availableLanguages}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
      />

      {/* 3. Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className='py-16 text-center border border-white/5 rounded-2xl bg-[#0e1322]'>
          <p className='text-slate-400 text-sm'>
            No projects match the search filter &quot;{searchQuery}&quot;.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredProjects.map((project) => (
            <ScannedProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
})

ScanResults.displayName = 'ScanResults'
