import { invoke } from '@tauri-apps/api/core'

/**
 * Type-safe invoke wrapper with standard logging and error handling
 */
export async function safeInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args)
  } catch (error) {
    console.error(`[Tauri IPC Error] Command "${command}" failed:`, error)
    throw error
  }
}
