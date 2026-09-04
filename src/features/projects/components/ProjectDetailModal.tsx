import React, { memo, useEffect, useState } from 'react'
import {
  X,
  Copy,
  Check,
  Code2,
  Terminal,
  FolderOpen,
  GitBranch,
  Play,
  Layers,
  FileCode,
  Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { ProjectInfo } from '@/types/project'
import { useProjectStore } from '@/stores/useProjectStore'

interface ProjectDetailModalProps {
  project: ProjectInfo | null
  onClose: () => void
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = memo(
  ({ project, onClose }) => {
    const openInEditor = useProjectStore((s) => s.openInEditor)
    const openInTerminal = useProjectStore((s) => s.openInTerminal)
    const openInFileManager = useProjectStore((s) => s.openInFileManager)

    const [copiedPath, setCopiedPath] = useState(false)
    const [copiedScript, setCopiedScript] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'scripts' | 'dependencies'>('overview')

    // Close on Escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    if (!project) return null

    const handleCopyPath = async () => {
      try {
        await navigator.clipboard.writeText(project.path)
        setCopiedPath(true)
        toast.success('Path copied to clipboard')
        setTimeout(() => setCopiedPath(false), 2000)
      } catch {
        toast.error('Failed to copy path')
      }
    }

    const handleCopyScriptCommand = async (scriptName: string, _scriptCommand?: string) => {
      try {
        const pm = project.package_manager || 'npm'
        const fullCmd = pm === 'cargo' ? `cargo ${scriptName}` : `${pm} run ${scriptName}`
        await navigator.clipboard.writeText(fullCmd)
        setCopiedScript(scriptName)
        toast.success(`Copied "${fullCmd}"`)
        setTimeout(() => setCopiedScript(null), 2000)
      } catch {
        toast.error('Failed to copy command')
      }
    }

    const scriptsCount = Object.keys(project.scripts || {}).length
    const dependenciesCount = project.dependencies?.length || 0

    return (
      <div
        className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className='bg-[#0f1424] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-150'>
          {/* Header */}
          <div className='p-5 border-b border-white/10 flex items-start justify-between gap-4 bg-[#12182c]'>
            <div className='min-w-0'>
              <div className='flex items-center gap-2.5 flex-wrap'>
                <h2 className='text-lg font-bold text-white tracking-tight truncate'>
                  {project.name}
                </h2>
                {project.version && (
                  <span className='px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'>
                    v{project.version}
                  </span>
                )}
                {project.git_branch && (
                  <span className='flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/5 text-slate-300 border border-white/10'>
                    <GitBranch size={11} className='text-indigo-400' />
                    {project.git_branch}
                  </span>
                )}
              </div>

              {/* Path with copy */}
              <div className='flex items-center gap-2 mt-1.5'>
                <span className='text-xs font-mono text-slate-400 truncate max-w-md'>
                  {project.path}
                </span>
                <button
                  onClick={handleCopyPath}
                  className='p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors cursor-pointer'
                  title='Copy absolute path'
                >
                  {copiedPath ? <Check size={12} className='text-emerald-400' /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className='p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer'
              title='Close dialog'
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className='flex items-center gap-2 px-5 pt-3 border-b border-white/5 bg-[#0f1424] text-xs font-medium'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package size={14} />
              <span>Overview</span>
            </button>

            {scriptsCount > 0 && (
              <button
                onClick={() => setActiveTab('scripts')}
                className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'scripts'
                    ? 'border-indigo-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Play size={14} />
                <span>Scripts ({scriptsCount})</span>
              </button>
            )}

            {dependenciesCount > 0 && (
              <button
                onClick={() => setActiveTab('dependencies')}
                className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dependencies'
                    ? 'border-indigo-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={14} />
                <span>Dependencies ({dependenciesCount})</span>
              </button>
            )}
          </div>

          {/* Tab Content Body */}
          <div className='flex-1 overflow-y-auto p-5 space-y-4 text-sm'>
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div className='space-y-4'>
                {project.description && (
                  <div className='bg-[#13192c] border border-white/5 rounded-xl p-3.5 text-slate-300 text-xs leading-relaxed'>
                    {project.description}
                  </div>
                )}

                <div className='grid grid-cols-2 gap-3 text-xs'>
                  <div className='bg-[#11172a] border border-white/5 rounded-xl p-3'>
                    <span className='text-slate-400 block mb-1'>Primary Language</span>
                    <span className='text-white font-semibold'>
                      {project.primary_language || 'Unknown'}
                    </span>
                  </div>

                  <div className='bg-[#11172a] border border-white/5 rounded-xl p-3'>
                    <span className='text-slate-400 block mb-1'>Package Manager</span>
                    <span className='text-white font-semibold font-mono'>
                      {project.package_manager || 'None detected'}
                    </span>
                  </div>

                  <div className='bg-[#11172a] border border-white/5 rounded-xl p-3'>
                    <span className='text-slate-400 block mb-1'>Git Status</span>
                    <span className='text-white font-semibold'>
                      {project.is_git_repo ? `Repository (${project.git_branch || 'main'})` : 'Not a git repo'}
                    </span>
                  </div>

                  <div className='bg-[#11172a] border border-white/5 rounded-xl p-3'>
                    <span className='text-slate-400 block mb-1'>Last Modified</span>
                    <span className='text-white font-semibold'>
                      {project.last_modified || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Frameworks */}
                {project.frameworks.length > 0 && (
                  <div>
                    <h4 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2'>
                      Detected Frameworks & Libraries
                    </h4>
                    <div className='flex flex-wrap gap-1.5'>
                      {project.frameworks.map((fw) => (
                        <span
                          key={fw}
                          className='px-2.5 py-1 rounded-lg text-xs font-medium bg-[#161d33] border border-white/10 text-slate-200'
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Scripts Tab */}
            {activeTab === 'scripts' && (
              <div className='space-y-2'>
                {Object.entries(project.scripts || {}).map(([name, cmd]) => (
                  <div
                    key={name}
                    className='group flex items-center justify-between gap-3 bg-[#11172a] hover:bg-[#151d36] border border-white/5 rounded-xl p-3 transition-colors'
                  >
                    <div className='min-w-0'>
                      <div className='text-xs font-mono font-bold text-indigo-300'>
                        {name}
                      </div>
                      <div className='text-[11px] font-mono text-slate-400 truncate max-w-lg mt-0.5'>
                        {cmd}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyScriptCommand(name, cmd)}
                      className='flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer flex-shrink-0'
                      title='Copy runnable script command'
                    >
                      {copiedScript === name ? (
                        <>
                          <Check size={12} className='text-emerald-400' />
                          <span className='text-emerald-400'>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Dependencies Tab */}
            {activeTab === 'dependencies' && (
              <div>
                <div className='flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto p-1'>
                  {project.dependencies?.map((dep) => (
                    <span
                      key={dep}
                      className='flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-[#11172a] border border-white/10 text-slate-300'
                    >
                      <FileCode size={11} className='text-indigo-400' />
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className='p-4 border-t border-white/10 bg-[#12182c] flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => openInEditor(project.path)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer'
              >
                <Code2 size={14} />
                <span>Open in Editor</span>
              </button>

              <button
                onClick={() => openInTerminal(project.path)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#161d33] hover:bg-[#1f2847] hover:text-white border border-white/10 transition-colors cursor-pointer'
              >
                <Terminal size={14} />
                <span>Terminal</span>
              </button>

              <button
                onClick={() => openInFileManager(project.path)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#161d33] hover:bg-[#1f2847] hover:text-white border border-white/10 transition-colors cursor-pointer'
              >
                <FolderOpen size={14} />
                <span>Reveal Folder</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className='px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }
)

ProjectDetailModal.displayName = 'ProjectDetailModal'
