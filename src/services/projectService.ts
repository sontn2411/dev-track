import { safeInvoke } from './tauri'
import { ScanResult } from '@/types/project'

export const projectService = {
  /**
   * Opens the OS native directory picker dialog
   */
  async pickDirectory(): Promise<string | null> {
    return safeInvoke<string | null>('pick_directory')
  },

  /**
   * Opens the OS native file picker dialog
   */
  async pickFile(): Promise<string | null> {
    return safeInvoke<string | null>('pick_file')
  },

  /**
   * Scans given filesystem paths for developer projects
   */
  async scanDirectories(paths: string[], depth = 4): Promise<ScanResult[]> {
    if (paths.length === 0) return []
    return safeInvoke<ScanResult[]>('scan_directories', { paths, depth })
  },
}
