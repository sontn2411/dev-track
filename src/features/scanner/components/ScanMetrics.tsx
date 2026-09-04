import React, { memo, useMemo } from 'react'
import { Box, Clock, Layers } from 'lucide-react'
import { useProjectStore } from '@/stores/useProjectStore'

export const ScanMetrics: React.FC = memo(() => {
  const scannedProjects = useProjectStore((s) => s.scannedProjects)
  const savedProjects = useProjectStore((s) => s.savedProjects)
  const totalScanned = useProjectStore((s) => s.totalScanned)
  const durationMs = useProjectStore((s) => s.scanDurationMs)

  const savedProjectIds = useMemo(
    () => new Set(savedProjects.map((p) => p.id)),
    [savedProjects]
  )

  const savedCount = useMemo(() => {
    return scannedProjects.filter((p) => savedProjectIds.has(p.id)).length
  }, [scannedProjects, savedProjectIds])

  if (scannedProjects.length === 0) return null

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      <div className='bg-[#11172c] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5'>
        <div className='w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400'>
          <Box size={20} />
        </div>
        <div>
          <div className='text-xs text-slate-400 font-medium'>
            Discovered Projects
          </div>
          <div className='flex items-baseline gap-1.5'>
            <span className='text-xl font-bold text-white'>
              {scannedProjects.length}
            </span>
            {totalScanned > 0 && (
              <span className='text-[11px] text-slate-500'>
                / {totalScanned} items scanned
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='bg-[#11172c] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5'>
        <div className='w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400'>
          <Clock size={20} />
        </div>
        <div>
          <div className='text-xs text-slate-400 font-medium'>
            Scan Duration
          </div>
          <div className='text-xl font-bold text-white'>
            {(durationMs / 1000).toFixed(2)}s
          </div>
        </div>
      </div>

      <div className='bg-[#11172c] border border-white/5 rounded-2xl p-4 flex items-center gap-3.5'>
        <div className='w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400'>
          <Layers size={20} />
        </div>
        <div>
          <div className='text-xs text-slate-400 font-medium'>
            Saved / Total
          </div>
          <div className='text-xl font-bold text-white'>
            {savedCount} / {scannedProjects.length}
          </div>
        </div>
      </div>
    </div>
  )
})

ScanMetrics.displayName = 'ScanMetrics'
