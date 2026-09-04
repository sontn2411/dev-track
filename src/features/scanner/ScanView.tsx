import React from 'react'
import { useProjects } from '@/context/ProjectContext'

interface ScanViewProps {
  onOpenFolderManager?: () => void
}

export const ScanView: React.FC<ScanViewProps> = () => {
  const { isScanning } = useProjects()

  return (
    <div className='flex-1 p-6 flex flex-col'>
      {/* Scanner view canvas ready for next development */}
      {isScanning ? (
        <div className='flex-1 flex items-center justify-center text-slate-400'>
          <span className='animate-pulse text-sm'>Scanning directories...</span>
        </div>
      ) : (
        <div className='flex-1'>
          {/* Scanner interface and discovered projects will render here */}
        </div>
      )}
    </div>
  )
}
