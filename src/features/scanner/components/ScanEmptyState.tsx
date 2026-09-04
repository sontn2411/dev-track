import React, { memo } from 'react'
import { FolderPlus } from 'lucide-react'
import { useProjectStore } from '@/stores/useProjectStore'

export const ScanEmptyState: React.FC = memo(() => {
  const rootFolders = useProjectStore((s) => s.rootFolders)
  const isScanning = useProjectStore((s) => s.isScanning)
  const pickFolder = useProjectStore((s) => s.pickFolder)

  if (rootFolders.length > 0) return null

  return (
    <div className='flex-1 min-h-[420px] flex flex-col items-center justify-center border border-white/10 rounded-2xl p-8 text-center bg-[#0d1322]/50'>
      <div className='w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5'>
        <FolderPlus size={30} className='text-indigo-400' />
      </div>

      <h2 className='text-lg font-semibold text-white mb-2'>
        Discover Your Developer Projects
      </h2>
      <p className='text-slate-400 text-sm max-w-md mb-6 leading-relaxed'>
        Select workspace directories containing your repositories (e.g.{' '}
        <code className='text-indigo-300 font-mono text-xs'>~/Projects</code>,{' '}
        <code className='text-indigo-300 font-mono text-xs'>D:\Workspace</code>
        ). Dev Track will automatically detect package managers, frameworks,
        and git repositories.
      </p>

      <button
        onClick={() => pickFolder()}
        disabled={isScanning}
        className='flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 shadow-sm transition-colors duration-150 cursor-pointer disabled:opacity-50'
      >
        <FolderPlus size={16} />
        <span>Select Folder to Scan</span>
      </button>
    </div>
  )
})

ScanEmptyState.displayName = 'ScanEmptyState'
