import React, { useState } from 'react'
import {
  Code2,
  Terminal,
  FolderOpen,
  FileCode,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { projectService } from '@/services/projectService'
import { launcherService } from '@/services/launcherService'
import { EditorType } from '@/types/project'

interface EditorPreset {
  id: EditorType
  name: string
  command: string
  description: string
  badge?: string
}

const EDITOR_PRESETS: EditorPreset[] = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    command: 'code',
    description:
      'Visual Studio Code executable ("code" or /Applications/Visual Studio Code.app)',
    badge: 'Default',
  },
  {
    id: 'antigravity',
    name: 'Antigravity IDE',
    command: 'antigravity',
    description:
      'Google Antigravity development environment (/Applications/Antigravity.app)',
    badge: 'AI IDE',
  },
  {
    id: 'custom',
    name: 'Custom Executable Path',
    command: 'custom',
    description: 'Specify a custom binary path, alias, or application bundle',
    badge: 'Advanced',
  },
]

export const SettingsView: React.FC = () => {
  const {
    editor,
    customEditorPath,
    terminal,
    scanDepth,
    setEditor,
    setCustomEditorPath,
    setTerminal,
    setScanDepth,
    getEffectiveEditorCommand,
  } = useSettingsStore()

  const savedProjects = useProjectStore((s) => s.savedProjects)
  const rootFolders = useProjectStore((s) => s.rootFolders)
  const clearCache = useProjectStore((s) => s.clearCache)

  const [isTesting, setIsTesting] = useState(false)

  // Browse for binary or file
  const handleBrowseFile = async () => {
    try {
      const selected = await projectService.pickFile()
      if (selected) {
        setCustomEditorPath(selected)
        setEditor('custom')
        toast.success(`Selected file: ${selected}`)
      }
    } catch {
      toast.error('Failed to open file picker')
    }
  }

  // Browse for .app bundle (macOS applications are folders) or directory
  const handleBrowseApp = async () => {
    try {
      const selected = await projectService.pickDirectory()
      if (selected) {
        setCustomEditorPath(selected)
        setEditor('custom')
        toast.success(`Selected application: ${selected}`)
      }
    } catch {
      toast.error('Failed to open directory picker')
    }
  }

  // Test launching the configured editor
  const handleTestEditor = async () => {
    const effectiveCmd = getEffectiveEditorCommand()
    if (!effectiveCmd) {
      toast.error('Please configure an editor command or path first')
      return
    }

    // Pick test target: first saved project path, first root folder, or home directory fallback
    const targetPath = savedProjects[0]?.path || rootFolders[0] || '.'

    setIsTesting(true)
    try {
      await launcherService.openInEditor(targetPath, effectiveCmd)
      toast.success(`Successfully launched "${effectiveCmd}"`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed to launch editor: ${msg}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className='flex-1 p-6 flex flex-col overflow-y-auto max-w-7xl mx-auto w-full'>
      {/* Header */}
      <div className='mb-8 border-b border-white/5 pb-6'>
        <h1 className='text-2xl font-bold text-white tracking-tight mb-1'>
          Settings
        </h1>
        <p className='text-slate-400 text-sm'>
          Customize your default code editor launcher, terminal, and scanning
          preferences.
        </p>
      </div>

      <div className='flex flex-col gap-8'>
        {/* Section 1: Code Editor Launcher */}
        <div className='flex flex-col gap-4'>
          <div>
            <h2 className='text-base font-semibold text-white flex items-center gap-2 mb-1'>
              <Code2 size={18} className='text-indigo-400' />
              <span>Code Editor</span>
            </h2>
            <p className='text-slate-400 text-xs leading-relaxed'>
              Select your preferred code editor or specify a custom executable
              path. When you click &quot;Code&quot; on any project, Dev Track
              launches this editor.
            </p>
          </div>

          {/* Editor Presets Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {EDITOR_PRESETS.map((preset) => {
              const isSelected = editor === preset.id

              return (
                <div
                  key={preset.id}
                  onClick={() => setEditor(preset.id)}
                  className={`relative p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-[#151c35] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/50'
                      : 'bg-[#0f1424] hover:bg-[#13192c] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-1.5 flex-wrap'>
                        <span className='font-semibold text-white text-sm truncate'>
                          {preset.name}
                        </span>
                        {preset.badge && (
                          <span className='text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'>
                            {preset.badge}
                          </span>
                        )}
                      </div>
                      <p className='text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2'>
                        {preset.description}
                      </p>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-white/20 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={10} className='stroke-[3]' />}
                    </div>
                  </div>

                  <div className='text-[10px] font-mono text-slate-500 flex items-center gap-1 pt-1 border-t border-white/5'>
                    <span>CLI:</span>
                    <span className='text-slate-400 bg-white/5 px-1.5 py-0.5 rounded'>
                      {preset.command}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Custom Path Input Configuration */}
          <div
            className={`mt-2 p-4 rounded-xl border transition-all duration-150 flex flex-col gap-3 ${
              editor === 'custom'
                ? 'bg-[#11172c] border-indigo-500/40 ring-1 ring-indigo-500/20'
                : 'bg-[#0d1322]/60 border-white/10'
            }`}
          >
            <div className='flex items-center justify-between gap-2 flex-wrap'>
              <label className='text-xs font-semibold text-slate-200 flex items-center gap-1.5'>
                <FileCode size={14} className='text-indigo-400' />
                <span>Custom Executable or Application Path</span>
              </label>

              {editor !== 'custom' && (
                <button
                  onClick={() => setEditor('custom')}
                  className='text-[11px] font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer underline underline-offset-2'
                >
                  Use custom path instead
                </button>
              )}
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='text'
                placeholder='/usr/local/bin/code or /Applications/Cursor.app'
                value={customEditorPath}
                onChange={(e) => {
                  setCustomEditorPath(e.target.value)
                  if (editor !== 'custom') setEditor('custom')
                }}
                className='flex-1 bg-[#0b0f1a] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors'
              />

              <button
                onClick={handleBrowseFile}
                className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer whitespace-nowrap'
                title='Browse for executable binary'
              >
                <FolderOpen size={13} />
                <span>Browse File</span>
              </button>

              <button
                onClick={handleBrowseApp}
                className='flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer whitespace-nowrap'
                title='Browse for .app bundle (macOS)'
              >
                <Sparkles size={13} />
                <span>Browse .app</span>
              </button>
            </div>

            <div className='flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed'>
              <HelpCircle
                size={13}
                className='text-slate-400 flex-shrink-0 mt-0.5'
              />
              <span>
                <strong>macOS Tip:</strong> You can select the application
                package (e.g.{' '}
                <code className='text-slate-400 font-mono'>
                  /Applications/Visual Studio Code.app
                </code>
                ) or terminal CLI command (e.g.{' '}
                <code className='text-slate-400 font-mono'>code</code>,{' '}
                <code className='text-slate-400 font-mono'>cursor</code>,{' '}
                <code className='text-slate-400 font-mono'>
                  /opt/homebrew/bin/zed
                </code>
                ).
              </span>
            </div>
          </div>

          {/* Test Action Bar */}
          <div className='flex items-center justify-between p-3 rounded-xl bg-[#0f1424] border border-white/5 mt-1'>
            <div className='text-xs text-slate-400'>
              Current active editor command:{' '}
              <strong className='text-indigo-300 font-mono'>
                {getEffectiveEditorCommand()}
              </strong>
            </div>

            <button
              onClick={handleTestEditor}
              disabled={isTesting}
              className='flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer disabled:opacity-50'
            >
              <Play size={12} />
              <span>{isTesting ? 'Launching...' : 'Test Launch'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Terminal Preferences */}
        <div className='flex flex-col gap-3 pt-6 border-t border-white/5'>
          <div>
            <h2 className='text-base font-semibold text-white flex items-center gap-2 mb-1'>
              <Terminal size={18} className='text-indigo-400' />
              <span>Terminal App</span>
            </h2>
            <p className='text-slate-400 text-xs leading-relaxed'>
              Choose which terminal emulator to open when clicking the Terminal
              action on projects.
            </p>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl'>
            {[
              { id: 'default', label: 'Default Terminal' },
              { id: 'iterm2', label: 'iTerm2' },
              { id: 'warp', label: 'Warp' },
              { id: 'alacritty', label: 'Alacritty' },
            ].map((term) => {
              const isSelected = terminal === term.id
              return (
                <button
                  key={term.id}
                  onClick={() => setTerminal(term.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer text-center ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-[#0f1424] text-slate-400 hover:text-white border-white/5 hover:bg-white/5'
                  }`}
                >
                  {term.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section 3: Scanner Settings */}
        <div className='flex flex-col gap-3 pt-6 border-t border-white/5'>
          <div>
            <h2 className='text-base font-semibold text-white flex items-center gap-2 mb-1'>
              <Layers size={18} className='text-indigo-400' />
              <span>Scanner Settings</span>
            </h2>
            <p className='text-slate-400 text-xs leading-relaxed'>
              Configure recursive scanning depth limits when searching for
              developer repositories.
            </p>
          </div>

          <div className='flex items-center gap-4 max-w-md bg-[#0f1424] border border-white/10 rounded-xl p-3.5'>
            <div className='flex-1'>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-slate-300 font-medium'>
                  Maximum Directory Depth
                </span>
                <span className='text-indigo-400 font-mono font-bold'>
                  {scanDepth} levels
                </span>
              </div>
              <input
                type='range'
                min='2'
                max='8'
                step='1'
                value={scanDepth}
                onChange={(e) => setScanDepth(Number(e.target.value))}
                className='w-full accent-indigo-500 cursor-pointer'
              />
            </div>
          </div>
        </div>

        {/* Section 4: Data & Cache Management */}
        <div className='flex flex-col gap-3 pt-6 border-t border-white/5 pb-12'>
          <div>
            <h2 className='text-base font-semibold text-white flex items-center gap-2 mb-1'>
              <RotateCcw size={18} className='text-slate-400' />
              <span>Cache Management</span>
            </h2>
            <p className='text-slate-400 text-xs leading-relaxed'>
              Clear temporary scan results without losing your saved projects.
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <button
              onClick={clearCache}
              className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-500/30 border border-white/10 transition-colors cursor-pointer'
            >
              <RotateCcw size={13} />
              <span>Clear Scan Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
