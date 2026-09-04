import React, { memo, useState, useMemo } from 'react'
import { FolderSearch, Settings2, RefreshCw } from 'lucide-react'
import { useProjectStore } from '@/stores/useProjectStore'
import { ScanMetrics } from './ScanMetrics'
import { ScanFilterBar } from './ScanFilterBar'
import { ScannedProjectCard } from './ScannedProjectCard'

export const ScanResults: React.FC = memo(() => {
  const rootFolders = useProjectStore((s) => s.rootFolders)
  const scannedProjects = useProjectStore((s) => s.scannedProjects)
  const isScanning = useProjectStore((s) => s.isScanning)
  const scanFolders = useProjectStore((s) => s.scanFolders)
  const setActiveTab = useProjectStore((s) => s.setActiveTab)

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

  if (rootFolders.length === 0) return null

  // Empty state when no projects were detected in monitored folders
  if (scannedProjects.length === 0) {
    if (isScanning) return null

    return (
      <div className='flex-1 min-h-[340px] flex flex-col items-center justify-center border border-white/10 rounded-2xl p-8 text-center bg-[#0d1322]/40'>
        <div className='w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4'>
          <FolderSearch size={26} />
        </div>
        <h3 className='text-base font-semibold text-white mb-1.5'>
          No projects found in monitored directories
        </h3>
        <p className='text-slate-400 text-xs max-w-md mb-5 leading-relaxed'>
          We searched your selected folders but didn&apos;t identify project manifest files (such as package.json, Cargo.toml, pyproject.toml, go.mod). Try increasing the scan depth in Settings or add subfolders directly.
        </p>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => scanFolders()}
            className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 transition-colors cursor-pointer'
          >
            <RefreshCw size={13} />
            <span>Rescan All</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer'
          >
            <Settings2 size={13} />
            <span>Adjust Scan Depth</span>
          </button>
        </div>
      </div>
    )
  }

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
