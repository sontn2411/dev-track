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

interface SavedProjectRowProps {
  project: ProjectInfo
  onOpenDetail: (project: ProjectInfo) => void
}

export const SavedProjectRow: React.FC<SavedProjectRowProps> = memo(
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

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 50 : undefined,
    }

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={`border-b transition-colors duration-150 group ${
          isDragging
            ? 'opacity-40 bg-indigo-950/40 border-indigo-500'
            : 'border-white/5 hover:bg-[#0f1424]'
        }`}
      >
        {/* Drag Handle Col */}
        <td className='py-3 pl-3 pr-1 w-8 text-center'>
          <div
            {...attributes}
            {...listeners}
            className='inline-flex items-center justify-center text-slate-600 hover:text-slate-300 active:text-indigo-400 cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-150 touch-none select-none'
            title='Drag to reorder'
          >
            <GripVertical size={13} />
          </div>
        </td>

        {/* Pin Col */}
        <td className='py-3 px-1 w-8 text-center'>
          <button
            onClick={() => togglePin(project.id)}
            className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
              isPinned
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'
            }`}
            title={isPinned ? 'Unpin project' : 'Pin project'}
          >
            <Pin size={14} className={isPinned ? 'fill-amber-400' : ''} />
          </button>
        </td>

        {/* Name & Branch */}
        <td className='py-3 px-3 max-w-[200px]'>
          <div className='flex items-center gap-2'>
            <span
              onClick={() => onOpenDetail(project)}
              className='font-medium text-white text-sm truncate hover:text-indigo-300 transition-colors duration-150 cursor-pointer'
              title={project.name}
            >
              {project.name}
            </span>
          </div>
          {project.git_branch && (
            <div className='flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5'>
              <GitBranch size={10} className='text-indigo-400 flex-shrink-0' />
              <span className='truncate'>{project.git_branch}</span>
            </div>
          )}
        </td>

        {/* Path Col */}
        <td className='py-3 px-3 max-w-[240px]'>
          <div
            onClick={handleCopyPath}
            className='inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#0b0f1a] border border-white/5 text-slate-400 hover:text-slate-200 text-[11px] font-mono cursor-pointer transition-colors duration-150 max-w-full'
            title='Click to copy path'
          >
            <span className='truncate'>{project.path}</span>
            <span className='flex-shrink-0'>
              {copied ? (
                <Check size={11} className='text-emerald-400' />
              ) : (
                <Copy size={11} className='text-slate-500' />
              )}
            </span>
          </div>
        </td>

        {/* Tech Badges Col */}
        <td className='py-3 px-3'>
          <div className='flex flex-wrap items-center gap-1.5'>
            {project.primary_language && project.primary_language !== 'Unknown' && (
              <span className='text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'>
                {project.primary_language}
              </span>
            )}

            {project.package_manager && (
              <span className='inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10'>
                <Package size={10} className='text-slate-400' />
                <span>{project.package_manager}</span>
              </span>
            )}

            {project.frameworks.slice(0, 3).map((fw) => (
              <span
                key={fw}
                className='text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10'
              >
                {fw}
              </span>
            ))}

            {project.frameworks.length > 3 && (
              <span className='text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400'>
                +{project.frameworks.length - 3}
              </span>
            )}
          </div>
        </td>

        {/* Quick Launch & Actions Col */}
        <td className='py-3 pr-4 pl-2 text-right whitespace-nowrap'>
          <div className='inline-flex items-center gap-1 justify-end'>
            <button
              onClick={() => openInEditor(project.path)}
              className='p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer'
              title='Open in Editor'
            >
              <Code2 size={14} />
            </button>

            <button
              onClick={() => openInTerminal(project.path)}
              className='p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer'
              title='Open in Terminal'
            >
              <Terminal size={14} />
            </button>

            <button
              onClick={() => openInFileManager(project.path)}
              className='p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer'
              title='Reveal in File Manager'
            >
              <FolderOpen size={14} />
            </button>

            <button
              onClick={() => onOpenDetail(project)}
              className='p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors duration-150 cursor-pointer'
              title='View Project Details'
            >
              <Info size={14} />
            </button>

            <button
              onClick={() => removeSavedProject(project.id)}
              className='p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 cursor-pointer'
              title='Remove from saved projects'
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
    )
  }
)

SavedProjectRow.displayName = 'SavedProjectRow'
