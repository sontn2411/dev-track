import React from 'react'
import { FolderKanban, Scan, Settings, Search } from 'lucide-react'
import logoText from '@/assets/logo-text.png'
import { NavTab } from '@/types/project'

interface SidebarProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  savedCount: number
  isScanning: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  isScanning,
}) => {
  return (
    <aside className='w-60 min-w-60 bg-[#0f1424] flex flex-col p-4 gap-4 flex-shrink-0 z-20 select-none border-r border-white/5'>
      {/* Brand Logo */}
      <div className='flex items-center px-1.5 py-0.5'>
        <img
          src={logoText}
          alt='Dev Track'
          className='h-16 max-w-full object-contain'
        />
      </div>

      {/* Quick Search trigger */}
      <div
        className='flex items-center gap-2 bg-[#11172c] border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer transition-all'
        onClick={() => {
          const searchInput =
            document.querySelector<HTMLInputElement>('input[type="text"]')
          searchInput?.focus()
          searchInput?.select()
        }}
        title='Quick search (⌘K)'
      >
        <Search size={14} />
        <span>Search quickly...</span>
        <kbd className='ml-auto text-[10px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-slate-400'>
          ⌘K
        </kbd>
      </div>

      {/* Main Navigation */}
      <nav className='flex flex-col gap-1'>
        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all w-full text-left cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-[#1e2448] text-white shadow-[0_0_16px_rgba(99,102,241,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          onClick={() => onSelectTab('projects')}
        >
          <FolderKanban
            size={17}
            className={activeTab === 'projects' ? 'text-indigo-400' : ''}
          />
          <span>Projects</span>
          {savedCount > 0 && (
            <span
              className={`ml-auto text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'projects'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {savedCount}
            </span>
          )}
        </button>

        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all w-full text-left cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-[#1e2448] text-white shadow-[0_0_16px_rgba(99,102,241,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          onClick={() => onSelectTab('scan')}
        >
          <Scan
            size={17}
            className={`${activeTab === 'scan' ? 'text-indigo-400' : ''} ${
              isScanning ? 'animate-spin' : ''
            }`}
          />
          <span>Scanner</span>
          {isScanning && (
            <span className='ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]' />
          )}
        </button>

        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all w-full text-left cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#1e2448] text-white shadow-[0_0_16px_rgba(99,102,241,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          onClick={() => onSelectTab('settings')}
        >
          <Settings
            size={17}
            className={activeTab === 'settings' ? 'text-indigo-400' : ''}
          />
          <span>Settings</span>
        </button>
      </nav>

      {/* App Version Footer */}
      <div className='mt-auto px-2 pt-2 flex items-center justify-between text-[11px] text-slate-500 select-none'>
        <span>v0.1.0</span>
      </div>
    </aside>
  )
}
