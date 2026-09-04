import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ProjectInfo, ScanResult, NavTab } from '@/types/project'
import { projectService } from '@/services/projectService'
import { launcherService } from '@/services/launcherService'

interface ProjectState {
  // Navigation
  activeTab: NavTab
  setActiveTab: (tab: NavTab) => void

  // State
  rootFolders: string[]
  scannedProjects: ProjectInfo[]
  savedProjects: ProjectInfo[]
  pinnedIds: string[]
  isScanning: boolean
  totalScanned: number
  scanDurationMs: number

  // Folder Actions
  pickFolder: () => Promise<string | null>
  addFolder: (path: string) => void
  removeFolder: (path: string) => void

  // Scan Actions
  scanFolders: (foldersToScan?: string[]) => Promise<void>
  clearCache: () => void

  // Project Collection Actions
  saveProject: (project: ProjectInfo) => void
  saveAllProjects: (projects: ProjectInfo[]) => void
  removeSavedProject: (id: string) => void
  togglePin: (id: string) => void

  // Launcher Actions
  openInEditor: (path: string, editor?: string) => Promise<void>
  openInTerminal: (path: string) => Promise<void>
  openInFileManager: (path: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Navigation
      activeTab: 'projects',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // State
      rootFolders: [],
      scannedProjects: [],
      savedProjects: [],
      pinnedIds: [],
      isScanning: false,
      totalScanned: 0,
      scanDurationMs: 0,

      // Folder Actions
      pickFolder: async () => {
        try {
          const selected = await projectService.pickDirectory()
          if (selected) {
            const { rootFolders, scanFolders } = get()
            if (!rootFolders.includes(selected)) {
              const nextFolders = [...rootFolders, selected]
              set({ rootFolders: nextFolders })
              scanFolders(nextFolders)
            }
          }
          return selected
        } catch (err) {
          console.error('Pick folder error:', err)
          return null
        }
      },

      addFolder: (path) => {
        const { rootFolders } = get()
        if (!rootFolders.includes(path)) {
          set({ rootFolders: [...rootFolders, path] })
        }
      },

      removeFolder: (path) => {
        const { rootFolders } = get()
        set({ rootFolders: rootFolders.filter((f) => f !== path) })
      },

      // Scan Actions
      scanFolders: async (foldersToScan) => {
        const targets = foldersToScan ?? get().rootFolders
        if (targets.length === 0) return

        set({ isScanning: true })
        try {
          const results: ScanResult[] = await projectService.scanDirectories(
            targets,
            4
          )

          let allProjects: ProjectInfo[] = []
          let totalCount = 0
          let totalTime = 0

          for (const res of results) {
            allProjects = allProjects.concat(res.projects)
            totalCount += res.total_scanned
            totalTime += res.duration_ms
          }

          const uniqueProjectsMap = new Map<string, ProjectInfo>()
          for (const p of allProjects) {
            uniqueProjectsMap.set(p.path, p)
          }

          set({
            scannedProjects: Array.from(uniqueProjectsMap.values()),
            totalScanned: totalCount,
            scanDurationMs: totalTime,
          })
        } catch (err) {
          console.error('Scan error:', err)
        } finally {
          set({ isScanning: false })
        }
      },

      clearCache: () => {
        set({ scannedProjects: [], totalScanned: 0, scanDurationMs: 0 })
      },

      // Project Collection Actions
      saveProject: (project) => {
        const { savedProjects } = get()
        if (!savedProjects.some((p) => p.id === project.id)) {
          set({ savedProjects: [...savedProjects, project] })
        }
      },

      saveAllProjects: (projectsToSave) => {
        const { savedProjects } = get()
        const existingIds = new Set(savedProjects.map((p) => p.id))
        const newProjects = projectsToSave.filter((p) => !existingIds.has(p.id))
        set({ savedProjects: [...savedProjects, ...newProjects] })
      },

      removeSavedProject: (id) => {
        const { savedProjects } = get()
        set({ savedProjects: savedProjects.filter((p) => p.id !== id) })
      },

      togglePin: (id) => {
        const { pinnedIds } = get()
        const next = pinnedIds.includes(id)
          ? pinnedIds.filter((item) => item !== id)
          : [...pinnedIds, id]
        set({ pinnedIds: next })
      },

      // Launcher Actions
      openInEditor: async (path, editor = 'vscode') => {
        try {
          await launcherService.openInEditor(path, editor)
        } catch (err) {
          console.error('Open editor error:', err)
        }
      },

      openInTerminal: async (path) => {
        try {
          await launcherService.openInTerminal(path)
        } catch (err) {
          console.error('Open terminal error:', err)
        }
      },

      openInFileManager: async (path) => {
        try {
          await launcherService.openInFileManager(path)
        } catch (err) {
          console.error('Open file manager error:', err)
        }
      },
    }),
    {
      name: 'dev_track_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rootFolders: state.rootFolders,
        scannedProjects: state.scannedProjects,
        savedProjects: state.savedProjects,
        pinnedIds: state.pinnedIds,
      }),
    }
  )
)
