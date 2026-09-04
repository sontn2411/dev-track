import React, { memo } from 'react'
import {
  Bookmark,
  Check,
  Code2,
  FolderOpen,
  GitBranch,
  Terminal,
} from 'lucide-react'
import { ProjectInfo } from '@/types/project'
import { useProjectStore } from '@/stores/useProjectStore'

interface ScannedProjectCardProps {
  project: ProjectInfo
}

export const ScannedProjectCard: React.FC<ScannedProjectCardProps> = memo(
  ({ project }) => {
    const isSaved = useProjectStore((s) =>
      s.savedProjects.some((p) => p.id === project.id),
    )
    const saveProject = useProjectStore((s) => s.saveProject)
    const openInEditor = useProjectStore((s) => s.openInEditor)
    const openInTerminal = useProjectStore((s) => s.openInTerminal)
    const openInFileManager = useProjectStore((s) => s.openInFileManager)

    return (
      <div className='group relative bg-[#0f1424] hover:bg-[#13192c] border border-white/10 hover:border-white/20 rounded-xl p-4 flex flex-col justify-between gap-3.5 transition-colors duration-150'>
        {/* Top Row: Name + Git Branch + Bookmark Action */}
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <h3 className='font-semibold text-white text-base tracking-tight truncate group-hover:text-indigo-300 transition-colors duration-150'>
              {project.name}
            </h3>

            {project.git_branch && (
              <div className='flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5'>
                <GitBranch
                  size={11}
                  className='text-indigo-400 flex-shrink-0'
                />
                <span className='truncate'>{project.git_branch}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => saveProject(project)}
            disabled={isSaved}
            className={`p-2 rounded-lg transition-colors duration-150 cursor-pointer flex-shrink-0 ${
              isSaved
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isSaved ? 'Saved in Projects' : 'Save this project'}
          >
            {isSaved ? <Check size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        {/* Path */}
        <div
          className='text-[11px] font-mono text-slate-500 hover:text-slate-400 truncate'
          title={project.path}
        >
          {project.path}
        </div>

        {/* Tech Badges */}
        <div className='flex flex-wrap items-center gap-1.5 pt-1'>
          {/* Primary Language */}
          {project.primary_language &&
            project.primary_language !== 'Unknown' && (
              <span className='text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'>
                {project.primary_language}
              </span>
            )}

          {/* Frameworks */}
          {project.frameworks.map((fw) => (
            <span
              key={fw}
              className='text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10'
            >
              {fw}
            </span>
          ))}
        </div>

        {/* Bottom Quick Launch Actions */}
        <div className='flex items-center gap-1 pt-2 border-t border-white/5'>
          <button
            onClick={() => openInEditor(project.path)}
            className='flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer'
            title='Open in Editor'
          >
            <Code2 size={13} />
            <span>Code</span>
          </button>

          <button
            onClick={() => openInTerminal(project.path)}
            className='flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer'
            title='Open Terminal'
          >
            <Terminal size={13} />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => openInFileManager(project.path)}
            className='flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer'
            title='Reveal in File Manager'
          >
            <FolderOpen size={13} />
            <span>Folder</span>
          </button>
        </div>
      </div>
    )
  },
)

ScannedProjectCard.displayName = 'ScannedProjectCard'
