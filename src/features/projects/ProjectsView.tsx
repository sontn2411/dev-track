import React from 'react'
import { useProjects } from '@/context/ProjectContext'

interface ProjectsViewProps {
  onNavigateToScan?: () => void
}

export const ProjectsView: React.FC<ProjectsViewProps> = () => {
  const { savedProjects } = useProjects()

  return (
    <div className='flex-1 p-6 flex flex-col'>
      {/* Feature Header / Placeholder ready for development */}
      {savedProjects.length === 0 ? (
        <div className='flex-1 flex flex-col items-center justify-center text-slate-500 text-sm'>
          {/* Canvas ready for Projects development */}
        </div>
      ) : (
        <div className='flex-1'>
          {/* Projects list/grid will render here */}
        </div>
      )}
    </div>
  )
}
