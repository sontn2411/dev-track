import React from 'react'
import { Sidebar } from './Sidebar'
import { NavTab } from '@/types/project'
import { useProjectStore } from '@/stores/useProjectStore'

interface AppLayoutProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  children,
}) => {
  const savedProjects = useProjectStore((s) => s.savedProjects)
  const isScanning = useProjectStore((s) => s.isScanning)

  return (
    <div className='flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans select-none'>
      {/* 1. Left Navbar / Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        savedCount={savedProjects.length}
        isScanning={isScanning}
      />

      {/* 2. Main Right Content Viewport */}
      <main className='flex-1 flex flex-col h-screen overflow-hidden bg-[#090d16]'>
        <div className='flex-1 overflow-y-auto overflow-x-hidden flex flex-col'>
          {children}
        </div>
      </main>
    </div>
  )
}
