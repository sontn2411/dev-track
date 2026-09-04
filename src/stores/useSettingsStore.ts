import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { EditorType } from '@/types/project'

export interface SettingsState {
  editor: EditorType
  customEditorPath: string
  terminal: string
  scanDepth: number

  setEditor: (editor: EditorType) => void
  setCustomEditorPath: (path: string) => void
  setTerminal: (terminal: string) => void
  setScanDepth: (depth: number) => void
  getEffectiveEditorCommand: () => string
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      editor: 'vscode',
      customEditorPath: '',
      terminal: 'default',
      scanDepth: 4,

      setEditor: (editor) => set({ editor }),
      setCustomEditorPath: (customEditorPath) => set({ customEditorPath }),
      setTerminal: (terminal) => set({ terminal }),
      setScanDepth: (scanDepth) => set({ scanDepth }),

      getEffectiveEditorCommand: () => {
        const { editor, customEditorPath } = get()
        if (editor === 'custom' && customEditorPath.trim()) {
          return customEditorPath.trim()
        }
        return editor
      },
    }),
    {
      name: 'dev_track_settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
