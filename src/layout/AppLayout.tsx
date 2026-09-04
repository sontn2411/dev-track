import React from 'react'
import { Sidebar } from './Sidebar'
import { NavTab } from '@/types/project'
import { useProjects } from '@/context/ProjectContext'

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
  const { savedProjects, isScanning } = useProjects()

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
