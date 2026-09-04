import React, { memo } from 'react'
import { Search, X } from 'lucide-react'

interface ScanFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  availableLanguages: string[]
  selectedLanguage: string
  onSelectLanguage: (language: string) => void
}

export const ScanFilterBar: React.FC<ScanFilterBarProps> = memo(
  ({
    searchQuery,
    onSearchChange,
    availableLanguages,
    selectedLanguage,
    onSelectLanguage,
  }) => {
    return (
      <div className='flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between'>
        {/* Search Input */}
        <div className='relative flex-1 max-w-md'>
          <Search
            size={16}
            className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
          />
          <input
            type='text'
            placeholder='Search by name, path, framework...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='w-full bg-[#11172c] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all'
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer'
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Language filter pills */}
        {availableLanguages.length > 0 && (
          <div className='flex items-center gap-1.5 overflow-x-auto py-1'>
            <button
              onClick={() => onSelectLanguage('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedLanguage === 'all'
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'bg-[#11172c] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              All
            </button>
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => onSelectLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedLanguage === lang
                    ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                    : 'bg-[#11172c] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

ScanFilterBar.displayName = 'ScanFilterBar'
