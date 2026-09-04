import React, { memo, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Pin,
  Code2,
  Terminal,
  FolderOpen,
  GitBranch,
  Info,
  Trash2,
  Copy,
  Check,
  Package,
  GripVertical,
} from 'lucide-react'
import { toast } from 'sonner'
import { ProjectInfo } from '@/types/project'
import { useProjectStore } from '@/stores/useProjectStore'

interface SavedProjectCardProps {
  project: ProjectInfo
  onOpenDetail: (project: ProjectInfo) => void
}

export const SavedProjectCard: React.FC<SavedProjectCardProps> = memo(
  ({ project, onOpenDetail }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: project.id })

    const pinnedIds = useProjectStore((s) => s.pinnedIds)
    const isPinned = pinnedIds.includes(project.id)
    const togglePin = useProjectStore((s) => s.togglePin)
    const removeSavedProject = useProjectStore((s) => s.removeSavedProject)
    const openInEditor = useProjectStore((s) => s.openInEditor)
    const openInTerminal = useProjectStore((s) => s.openInTerminal)
    const openInFileManager = useProjectStore((s) => s.openInFileManager)

    const [copied, setCopied] = useState(false)

    const handleCopyPath = async (e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(project.path)
        setCopied(true)
        toast.success('Path copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error('Failed to copy path')
      }
    }

    const scriptCount = Object.keys(project.scripts || {}).length

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 50 : undefined,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-[#0f1424] hover:bg-[#13192c] border rounded-xl p-4 flex flex-col justify-between gap-3.5 transition-colors duration-150 ${
          isDragging
            ? 'opacity-40 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.35)] ring-1 ring-indigo-500/50'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        {/* Top Header: Title, Git Branch & Pin / Delete */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-2 min-w-0 flex-1'>
            {/* Drag Handle Icon */}
            <div
              {...attributes}
              {...listeners}
              className='mt-1 text-slate-600 hover:text-slate-300 active:text-indigo-400 p-0.5 rounded transition-colors duration-150 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none select-none'
              title='Drag to reorder'
            >
              <GripVertical size={14} />
            </div>

            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h3
                  onClick={() => onOpenDetail(project)}
                  className='font-semibold text-white text-base tracking-tight truncate hover:text-indigo-300 transition-colors duration-150 cursor-pointer'
                  title={project.name}
                >
                  {project.name}
                </h3>
              </div>

              {project.git_branch && (
                <div className='flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-1'>
                  <GitBranch size={11} className='text-indigo-400 flex-shrink-0' />
                  <span className='truncate'>{project.git_branch}</span>
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-1 flex-shrink-0'>
            {/* Pin Button */}
            <button
              onClick={() => togglePin(project.id)}
              className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                isPinned
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
              title={isPinned ? 'Unpin project' : 'Pin to top'}
            >
              <Pin size={14} className={isPinned ? 'fill-amber-400' : ''} />
            </button>

            {/* Remove Button */}
            <button
              onClick={() => removeSavedProject(project.id)}
              className='p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 cursor-pointer border border-transparent'
              title='Remove from saved projects'
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Path Display with Copy */}
        <div
          onClick={handleCopyPath}
          className='flex items-center justify-between gap-2 px-2 py-1 rounded bg-[#0b0f1a] border border-white/5 text-slate-500 hover:text-slate-300 text-[11px] font-mono cursor-pointer transition-colors duration-150'
          title='Click to copy path'
        >
          <span className='truncate'>{project.path}</span>
          <span className='flex-shrink-0'>
            {copied ? (
              <Check size={12} className='text-emerald-400' />
            ) : (
              <Copy size={12} className='text-slate-500 hover:text-slate-300' />
            )}
          </span>
        </div>

        {/* Description (if present) */}
        {project.description && (
          <p className='text-xs text-slate-400 line-clamp-2 leading-relaxed'>
            {project.description}
          </p>
        )}

        {/* Tech Badges */}
        <div className='flex flex-wrap items-center gap-1.5 pt-0.5'>
          {/* Primary Language */}
          {project.primary_language && project.primary_language !== 'Unknown' && (
            <span className='text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'>
              {project.primary_language}
            </span>
          )}

          {/* Package Manager */}
          {project.package_manager && (
            <span className='flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10'>
              <Package size={11} className='text-slate-400' />
              <span>{project.package_manager}</span>
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

          {/* Scripts count badge */}
          {scriptCount > 0 && (
            <span className='text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5'>
              {scriptCount} {scriptCount === 1 ? 'script' : 'scripts'}
            </span>
          )}
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
            title='Open in Terminal'
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

          <button
            onClick={() => onOpenDetail(project)}
            className='p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors duration-150 cursor-pointer'
            title='View Project Details'
          >
            <Info size={14} />
          </button>
        </div>
      </div>
    )
  }
)

SavedProjectCard.displayName = 'SavedProjectCard'
