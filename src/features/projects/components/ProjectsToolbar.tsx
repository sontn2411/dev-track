import React, { memo } from 'react'
import {
  Search,
  X,
  Pin,
  LayoutGrid,
  List,
  ArrowUpDown,
} from 'lucide-react'
import { Select, SelectOption } from '@/components/ui'

export type ProjectSortOption =
  | 'custom'
  | 'recent'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'frameworks'
  | 'language'
export type ProjectViewMode = 'grid' | 'table'

const SORT_OPTIONS: SelectOption<ProjectSortOption>[] = [
  { value: 'custom', label: 'Custom order' },
  { value: 'recent', label: 'Recently modified' },
  { value: 'oldest', label: 'Oldest modified' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'frameworks', label: 'Frameworks count' },
  { value: 'language', label: 'Language' },
]

interface ProjectsToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedLanguage: string
  onSelectLanguage: (lang: string) => void
  availableLanguages: string[]
  showPinnedOnly: boolean
  onTogglePinnedOnly: () => void
  pinnedCount: number
  totalCount: number
  filteredCount: number
  sortOption: ProjectSortOption
  onSortChange: (sort: ProjectSortOption) => void
  viewMode: ProjectViewMode
  onViewModeChange: (mode: ProjectViewMode) => void
}

export const ProjectsToolbar: React.FC<ProjectsToolbarProps> = memo(
  ({
    searchQuery,
    onSearchChange,
    selectedLanguage,
    onSelectLanguage,
    availableLanguages,
    showPinnedOnly,
    onTogglePinnedOnly,
    pinnedCount,
    totalCount,
    filteredCount,
    sortOption,
    onSortChange,
    viewMode,
    onViewModeChange,
  }) => {
    return (
      <div className='flex flex-col gap-3.5'>
        {/* Top Controls Row */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
          {/* Search Input */}
          <div className='relative flex-1 max-w-md'>
            <Search
              size={15}
              className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
            />
            <input
              type='text'
              data-search-input
              placeholder='Search by name, path, framework... (⌘K / Ctrl+K)'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='w-full bg-[#11172c] border border-white/10 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors'
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer'
                title='Clear search'
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Toolbar Actions */}
          <div className='flex items-center gap-2 flex-wrap'>
            {/* Pinned filter toggle */}
            <button
              onClick={onTogglePinnedOnly}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors duration-150 cursor-pointer ${
                showPinnedOnly
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-[#11172c] text-slate-400 hover:text-slate-200 border-white/10'
              }`}
              title='Filter pinned projects'
            >
              <Pin
                size={13}
                className={showPinnedOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}
              />
              <span>Pinned</span>
              {pinnedCount > 0 && (
                <span className='ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/10 text-amber-300'>
                  {pinnedCount}
                </span>
              )}
            </button>

            {/* Sort Select */}
            <Select<ProjectSortOption>
              value={sortOption}
              options={SORT_OPTIONS}
              onChange={onSortChange}
              icon={<ArrowUpDown size={13} />}
            />

            {/* View Mode Toggle: Grid vs Table */}
            <div className='flex items-center p-0.5 rounded-xl bg-[#11172c] border border-white/10'>
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title='Grid View'
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title='Table View'
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Row: Language filter pills + counter */}
        <div className='flex items-center justify-between gap-2 overflow-x-auto py-0.5'>
          {availableLanguages.length > 0 && (
            <div className='flex items-center gap-1.5 overflow-x-auto'>
              <button
                onClick={() => onSelectLanguage('all')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                  selectedLanguage === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#11172c] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                All
              </button>
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => onSelectLanguage(lang)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                    selectedLanguage === lang
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#11172c] text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          {/* Counts */}
          <div className='text-xs text-slate-500 font-mono whitespace-nowrap ml-auto'>
            {filteredCount === totalCount ? (
              <span>{totalCount} {totalCount === 1 ? 'project' : 'projects'}</span>
            ) : (
              <span>
                {filteredCount} of {totalCount} projects
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
)

ProjectsToolbar.displayName = 'ProjectsToolbar'
