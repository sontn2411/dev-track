import React, { memo } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { ProjectsEmptyState, ProjectsList } from './components'

interface ProjectsViewProps {
  onNavigateToScan?: () => void
}

export const ProjectsView: React.FC<ProjectsViewProps> = memo(() => {
  const savedProjects = useProjectStore((s) => s.savedProjects)

  return (
    <div className='flex-1 p-6 flex flex-col overflow-y-auto'>
      {savedProjects.length === 0 ? (
        <ProjectsEmptyState />
      ) : (
        <ProjectsList />
      )}
    </div>
  )
})

ProjectsView.displayName = 'ProjectsView'
