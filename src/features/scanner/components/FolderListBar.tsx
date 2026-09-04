import React, { memo, useMemo, useCallback } from 'react'
import {
  BookmarkCheck,
  Folder,
  FolderPlus,
  RefreshCw,
  X,
} from 'lucide-react'
import { useProjectStore } from '@/stores/useProjectStore'

export const FolderListBar: React.FC = memo(() => {
  const rootFolders = useProjectStore((s) => s.rootFolders)
  const isScanning = useProjectStore((s) => s.isScanning)
  const scannedProjects = useProjectStore((s) => s.scannedProjects)
  const savedProjects = useProjectStore((s) => s.savedProjects)
  const pickFolder = useProjectStore((s) => s.pickFolder)
  const scanFolders = useProjectStore((s) => s.scanFolders)
  const removeFolder = useProjectStore((s) => s.removeFolder)
  const saveAllProjects = useProjectStore((s) => s.saveAllProjects)
  const clearCache = useProjectStore((s) => s.clearCache)

  const savedProjectIds = useMemo(
    () => new Set(savedProjects.map((p) => p.id)),
    [savedProjects]
  )

  const unsavedCount = useMemo(() => {
    return scannedProjects.filter((p) => !savedProjectIds.has(p.id)).length
  }, [scannedProjects, savedProjectIds])

  const handleScanSingle = useCallback(
    (path: string) => {
      scanFolders([path])
    },
    [scanFolders]
  )

  const handleSaveAll = useCallback(() => {
    saveAllProjects(scannedProjects)
  }, [saveAllProjects, scannedProjects])

  if (rootFolders.length === 0) return null

  return (
    <div className='flex flex-col gap-3 pb-4 border-b border-white/5'>
      <div className='flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1'>
        <div className='flex items-center gap-2'>
          <span>Monitored Directories ({rootFolders.length})</span>
          {isScanning && (
            <span className='flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 lowercase tracking-normal animate-pulse'>
              <RefreshCw size={10} className='animate-spin' />
              scanning...
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className='flex items-center gap-2'>
          <button
            onClick={() => pickFolder()}
            disabled={isScanning}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-150 cursor-pointer disabled:opacity-50'
          >
            <FolderPlus size={13} />
            <span>Add Folder</span>
          </button>

          <button
            onClick={() => scanFolders()}
            disabled={isScanning}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#161d33] hover:bg-[#1f2847] hover:text-white border border-white/10 hover:border-white/20 transition-colors duration-150 cursor-pointer disabled:opacity-50'
            title='Rescan all directories'
          >
            <RefreshCw
              size={12}
              className={isScanning ? 'animate-spin text-indigo-400' : ''}
            />
            <span>Rescan</span>
          </button>

          {unsavedCount > 0 && (
            <button
              onClick={handleSaveAll}
              disabled={isScanning}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 transition-colors duration-150 cursor-pointer'
              title='Save all new projects'
            >
              <BookmarkCheck size={13} />
              <span>Save All ({unsavedCount})</span>
            </button>
          )}

          {scannedProjects.length > 0 && (
            <button
              onClick={clearCache}
              disabled={isScanning}
              className='p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 cursor-pointer'
              title='Clear scan list'
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Directory chips */}
      <div className='flex flex-wrap gap-2'>
        {rootFolders.map((folderPath) => (
          <div
            key={folderPath}
            className='group flex items-center gap-2 bg-[#12182b] hover:bg-[#171f38] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 text-xs text-slate-300 transition-colors duration-150'
          >
            <Folder size={14} className='text-indigo-400 flex-shrink-0' />
            <span
              className='max-w-xs md:max-w-md truncate font-mono text-[11px] text-slate-300'
              title={folderPath}
            >
              {folderPath}
            </span>

            <button
              onClick={() => handleScanSingle(folderPath)}
              disabled={isScanning}
              className='p-1 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-white/5 transition-colors duration-150 cursor-pointer'
              title='Rescan this directory'
            >
              <RefreshCw
                size={12}
                className={isScanning ? 'animate-spin' : ''}
              />
            </button>

            <button
              onClick={() => removeFolder(folderPath)}
              disabled={isScanning}
              className='p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors duration-150 cursor-pointer'
              title='Remove directory'
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
})

FolderListBar.displayName = 'FolderListBar'
