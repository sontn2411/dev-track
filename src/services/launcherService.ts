import { safeInvoke } from './tauri'
import { EditorType } from '@/types/project'

export const launcherService = {
  /**
   * Opens the project in the specified or default editor
   */
  async openInEditor(path: string, editor: EditorType | string = 'vscode'): Promise<void> {
    return safeInvoke<void>('open_in_editor', { path, editor })
  },

  /**
   * Opens the project path in the default or specified terminal emulator
   */
  async openInTerminal(path: string, terminal?: string): Promise<void> {
    return safeInvoke<void>('open_in_terminal', { path, terminal })
  },

  /**
   * Reveals or opens the project folder in the OS file manager (Finder / Explorer)
   */
  async openInFileManager(path: string): Promise<void> {
    return safeInvoke<void>('open_in_file_manager', { path })
  },
}
