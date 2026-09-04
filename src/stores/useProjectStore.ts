import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import { ProjectInfo, ScanResult, NavTab } from '@/types/project'
import { projectService } from '@/services/projectService'
import { launcherService } from '@/services/launcherService'
import { useSettingsStore } from './useSettingsStore'

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
  reorderSavedProjects: (sourceId: string, targetId: string) => void
  setSavedProjects: (projects: ProjectInfo[]) => void

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
              toast.info(`Scanning directory: ${selected}`)
              await scanFolders(nextFolders)
            } else {
              toast.info(`Rescanning directory: ${selected}`)
              await scanFolders([selected])
            }
          }
          return selected
        } catch (err) {
          console.error('Pick folder error:', err)
          toast.error('Failed to select directory')
          return null
        }
      },

      addFolder: (path) => {
        const { rootFolders } = get()
        if (!rootFolders.includes(path)) {
          set({ rootFolders: [...rootFolders, path] })
          toast.success('Directory added to scan list')
        }
      },

      removeFolder: (path) => {
        const { rootFolders, scannedProjects } = get()
        const nextFolders = rootFolders.filter((f) => f !== path)

        // Remove projects originating from the removed folder path
        const nextProjects =
          nextFolders.length === 0
            ? []
            : scannedProjects.filter(
                (p) =>
                  p.path !== path &&
                  !p.path.startsWith(path + '/') &&
                  !p.path.startsWith(path + '\\')
              )

        set({
          rootFolders: nextFolders,
          scannedProjects: nextProjects,
          ...(nextFolders.length === 0
            ? { totalScanned: 0, scanDurationMs: 0 }
            : {}),
        })
        toast.info('Directory removed from scan list')
      },

      // Scan Actions
      scanFolders: async (foldersToScan) => {
        const targets = foldersToScan ?? get().rootFolders
        if (targets.length === 0) {
          toast.warning('No directories to scan')
          return
        }

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

          const projectList = Array.from(uniqueProjectsMap.values())
          set({
            scannedProjects: projectList,
            totalScanned: totalCount,
            scanDurationMs: totalTime,
          })

          toast.success(
            `Found ${projectList.length} projects (${(totalTime / 1000).toFixed(2)}s)`
          )
        } catch (err) {
          console.error('Scan error:', err)
          toast.error('An error occurred during scanning')
        } finally {
          set({ isScanning: false })
        }
      },

      clearCache: () => {
        set({ scannedProjects: [], totalScanned: 0, scanDurationMs: 0 })
        toast.info('Scan cache cleared')
      },

      // Project Collection Actions
      saveProject: (project) => {
        const { savedProjects } = get()
        if (!savedProjects.some((p) => p.id === project.id)) {
          set({ savedProjects: [...savedProjects, project] })
          toast.success(`Saved "${project.name}" to projects`)
        }
      },

      saveAllProjects: (projectsToSave) => {
        const { savedProjects } = get()
        const existingIds = new Set(savedProjects.map((p) => p.id))
        const newProjects = projectsToSave.filter((p) => !existingIds.has(p.id))
        set({ savedProjects: [...savedProjects, ...newProjects] })
        toast.success(`Saved ${newProjects.length} new projects`)
      },

      removeSavedProject: (id) => {
        const { savedProjects } = get()
        const target = savedProjects.find((p) => p.id === id)
        set({ savedProjects: savedProjects.filter((p) => p.id !== id) })
        if (target) {
          toast.info(`Removed "${target.name}"`)
        }
      },

      togglePin: (id) => {
        const { pinnedIds } = get()
        const next = pinnedIds.includes(id)
          ? pinnedIds.filter((item) => item !== id)
          : [...pinnedIds, id]
        set({ pinnedIds: next })
      },

      reorderSavedProjects: (sourceId, targetId) => {
        const { savedProjects } = get()
        const sourceIndex = savedProjects.findIndex((p) => p.id === sourceId)
        const targetIndex = savedProjects.findIndex((p) => p.id === targetId)
        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return

        const updated = [...savedProjects]
        const [movedItem] = updated.splice(sourceIndex, 1)
        updated.splice(targetIndex, 0, movedItem)
        set({ savedProjects: updated })
      },

      setSavedProjects: (projects) => {
        set({ savedProjects: projects })
      },

      // Launcher Actions
      openInEditor: async (path, editor) => {
        try {
          const targetEditor = editor || useSettingsStore.getState().getEffectiveEditorCommand()
          await launcherService.openInEditor(path, targetEditor)
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
