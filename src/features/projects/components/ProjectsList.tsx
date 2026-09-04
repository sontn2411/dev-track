import React, { memo, useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { FolderKanban, RotateCcw } from 'lucide-react'
import { ProjectInfo } from '@/types/project'
import { useProjectStore } from '@/stores/useProjectStore'
import {
  ProjectsToolbar,
  ProjectSortOption,
  ProjectViewMode,
} from './ProjectsToolbar'
import { SavedProjectCard } from './SavedProjectCard'
import { SavedProjectRow } from './SavedProjectRow'
import { ProjectDetailModal } from './ProjectDetailModal'

export const ProjectsList: React.FC = memo(() => {
  const savedProjects = useProjectStore((s) => s.savedProjects)
  const pinnedIds = useProjectStore((s) => s.pinnedIds)
  const reorderSavedProjects = useProjectStore((s) => s.reorderSavedProjects)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [sortOption, setSortOption] = useState<ProjectSortOption>('custom')
  const [viewMode, setViewMode] = useState<ProjectViewMode>('grid')
  const [detailProject, setDetailProject] = useState<ProjectInfo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // 4px drag activation threshold
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderSavedProjects(String(active.id), String(over.id))
      if (sortOption !== 'custom') {
        setSortOption('custom')
      }
    }
  }

  // Extract all unique languages from saved projects
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>()
    savedProjects.forEach((p) => {
      if (p.primary_language && p.primary_language !== 'Unknown') {
        langs.add(p.primary_language)
      }
    })
    return Array.from(langs).sort()
  }, [savedProjects])

  // Filter projects
  const filteredProjects = useMemo(() => {
    return savedProjects.filter((p) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        query === '' ||
        p.name.toLowerCase().includes(query) ||
        p.path.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.frameworks.some((f) => f.toLowerCase().includes(query)) ||
        p.primary_language.toLowerCase().includes(query) ||
        (p.package_manager && p.package_manager.toLowerCase().includes(query))

      const matchesLang =
        selectedLanguage === 'all' ||
        p.primary_language.toLowerCase() === selectedLanguage.toLowerCase()

      const matchesPin = !showPinnedOnly || pinnedIds.includes(p.id)

      return matchesSearch && matchesLang && matchesPin
    })
  }, [savedProjects, searchQuery, selectedLanguage, showPinnedOnly, pinnedIds])

  // Sort projects:
  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects]

    if (sortOption === 'custom') {
      return list
    }

    list.sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id)
      const bPinned = pinnedIds.includes(b.id)

      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1

      switch (sortOption) {
        case 'recent': {
          const timeA = a.last_modified ? new Date(a.last_modified).getTime() : 0
          const timeB = b.last_modified ? new Date(b.last_modified).getTime() : 0
          return timeB - timeA
        }
        case 'oldest': {
          const timeA = a.last_modified ? new Date(a.last_modified).getTime() : 0
          const timeB = b.last_modified ? new Date(b.last_modified).getTime() : 0
          return timeA - timeB
        }
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'frameworks':
          return (b.frameworks?.length || 0) - (a.frameworks?.length || 0)
        case 'language':
          return (a.primary_language || '').localeCompare(b.primary_language || '')
        default:
          return 0
      }
    })

    return list
  }, [filteredProjects, pinnedIds, sortOption])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedLanguage('all')
    setShowPinnedOnly(false)
  }

  const projectIds = useMemo(() => sortedProjects.map((p) => p.id), [sortedProjects])

  return (
    <div className='flex flex-col gap-5'>
      {/* Search & Filter Toolbar */}
      <ProjectsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        availableLanguages={availableLanguages}
        showPinnedOnly={showPinnedOnly}
        onTogglePinnedOnly={() => setShowPinnedOnly((prev) => !prev)}
        pinnedCount={pinnedIds.filter((id) => savedProjects.some((p) => p.id === id)).length}
        totalCount={savedProjects.length}
        filteredCount={filteredProjects.length}
        sortOption={sortOption}
        onSortChange={setSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Projects Display: Grid or Table with dnd-kit */}
      {sortedProjects.length === 0 ? (
        <div className='py-16 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-[#0e1322] text-center p-6'>
          <FolderKanban size={32} className='text-slate-500 mb-3' />
          <p className='text-slate-300 font-medium text-sm mb-1'>
            No projects match your current filters
          </p>
          <p className='text-slate-500 text-xs max-w-sm mb-4'>
            Try adjusting your search keywords, clearing language filters, or disabling the pinned filter.
          </p>
          <button
            onClick={handleResetFilters}
            className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-150 cursor-pointer'
          >
            <RotateCcw size={12} />
            <span>Reset filters</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={projectIds} strategy={rectSortingStrategy}>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {sortedProjects.map((project) => (
                <SavedProjectCard
                  key={project.id}
                  project={project}
                  onOpenDetail={setDetailProject}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-white/10 bg-[#0c111e]'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0f1424]'>
                <th className='py-3 pl-3 pr-1 w-8 text-center'></th>
                <th className='py-3 px-1 w-8 text-center'>Pin</th>
                <th className='py-3 px-3'>Project</th>
                <th className='py-3 px-3'>Directory</th>
                <th className='py-3 px-3'>Tech Stack</th>
                <th className='py-3 pr-4 pl-2 text-right'>Actions</th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
                <tbody>
                  {sortedProjects.map((project) => (
                    <SavedProjectRow
                      key={project.id}
                      project={project}
                      onOpenDetail={setDetailProject}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      )}

      {/* Project Detail Modal */}
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
        />
      )}
    </div>
  )
})

ProjectsList.displayName = 'ProjectsList'
