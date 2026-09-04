import React from 'react'
import { FolderListBar, ScanEmptyState, ScanResults } from './components'

export const ScanView: React.FC = () => {
  return (
    <div className='flex-1 flex flex-col p-6 gap-6 max-w-7xl w-full mx-auto overflow-y-auto'>
      <FolderListBar />
      <ScanEmptyState />
      <ScanResults />
    </div>
  )
}
