import React, { memo } from 'react'
import { FolderKanban, Scan } from 'lucide-react'
import { useProjectStore } from '@/stores/useProjectStore'

export const ProjectsEmptyState: React.FC = memo(() => {
  const setActiveTab = useProjectStore((s) => s.setActiveTab)

  return (
    <div className='flex-1 min-h-[440px] flex flex-col items-center justify-center border border-white/10 rounded-2xl p-8 text-center bg-[#0d1322]/50'>
      <div className='w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5'>
        <FolderKanban size={30} className='text-indigo-400' />
      </div>

      <h2 className='text-lg font-semibold text-white mb-2'>
        No saved projects yet
      </h2>
      <p className='text-slate-400 text-sm max-w-md mb-6 leading-relaxed'>
        You haven&apos;t saved any projects to your workspace yet. Use the Scanner to discover repositories and save them for instant access.
      </p>

      <button
        onClick={() => setActiveTab('scan')}
        className='flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-sm transition-colors duration-150 cursor-pointer'
      >
        <Scan size={16} />
        <span>Go to Scanner</span>
      </button>
    </div>
  )
})

ProjectsEmptyState.displayName = 'ProjectsEmptyState'
