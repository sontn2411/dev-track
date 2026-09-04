import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { ProjectInfo, ScanResult } from '@/types/project'
import { STORAGE_KEYS } from '@/constants/storage'
import { projectService } from '@/services/projectService'
import { launcherService } from '@/services/launcherService'
import { useProjectStore } from '@/stores/useProjectStore'

interface ProjectContextType {
  // State
  rootFolders: string[]
  scannedProjects: ProjectInfo[]
  savedProjects: ProjectInfo[]
  pinnedIds: Set<string>
  isScanning: boolean
  totalScanned: number
  scanDurationMs: number
  savedProjectIds: Set<string>

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

const ProjectContext = createContext<ProjectContextType | null>(null)

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 1. Root Folders
  const [rootFolders, setRootFolders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 2. Scanned Projects (Discovery buffer)
  const [scannedProjects, setScannedProjects] = useState<ProjectInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCANNED)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 3. Saved Projects (User workspace)
  const [savedProjects, setSavedProjects] = useState<ProjectInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 4. Pinned Project IDs
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PINNED)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  // 5. Scan Metrics & State
  const [isScanning, setIsScanning] = useState(false)
  const [totalScanned, setTotalScanned] = useState(0)
  const [scanDurationMs, setScanDurationMs] = useState(0)

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(rootFolders))
  }, [rootFolders])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCANNED, JSON.stringify(scannedProjects))
  }, [scannedProjects])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(savedProjects))
  }, [savedProjects])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.PINNED,
      JSON.stringify(Array.from(pinnedIds))
    )
  }, [pinnedIds])

  // Scan Directories
  const scanFolders = useCallback(
    async (foldersToScan: string[] = rootFolders) => {
      if (foldersToScan.length === 0) return
      setIsScanning(true)
      try {
        const results: ScanResult[] = await projectService.scanDirectories(
          foldersToScan,
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

        // Deduplicate projects by path
        const uniqueProjectsMap = new Map<string, ProjectInfo>()
        for (const p of allProjects) {
          uniqueProjectsMap.set(p.path, p)
        }

        const scannedList = Array.from(uniqueProjectsMap.values())
        setScannedProjects(scannedList)
        setTotalScanned(totalCount)
        setScanDurationMs(totalTime)
      } catch (err) {
        console.error('Scan error:', err)
      } finally {
        setIsScanning(false)
      }
    },
    [rootFolders]
  )

  // Folder Actions
  const pickFolder = useCallback(async (): Promise<string | null> => {
    try {
      const selected = await projectService.pickDirectory()
      if (selected && !rootFolders.includes(selected)) {
        const nextFolders = [...rootFolders, selected]
        setRootFolders(nextFolders)
        scanFolders(nextFolders)
      }
      return selected
    } catch (err) {
      console.error('Pick directory error:', err)
      return null
    }
  }, [rootFolders, scanFolders])

  const addFolder = useCallback((path: string) => {
    setRootFolders((prev) => (prev.includes(path) ? prev : [...prev, path]))
  }, [])

  const removeFolder = useCallback((path: string) => {
    setRootFolders((prev) => prev.filter((f) => f !== path))
  }, [])

  // Project Collection Actions
  const saveProject = useCallback((project: ProjectInfo) => {
    setSavedProjects((prev) => {
      if (prev.some((p) => p.id === project.id)) return prev
      return [...prev, project]
    })
  }, [])

  const saveAllProjects = useCallback((projectsToSave: ProjectInfo[]) => {
    setSavedProjects((prev) => {
      const existingIds = new Set(prev.map((p) => p.id))
      const newProjects = projectsToSave.filter((p) => !existingIds.has(p.id))
      return [...prev, ...newProjects]
    })
  }, [])

  const removeSavedProject = useCallback((id: string) => {
    setSavedProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearCache = useCallback(() => {
    setScannedProjects([])
    localStorage.removeItem(STORAGE_KEYS.SCANNED)
  }, [])

  // Launcher Actions
  const openInEditor = useCallback(
    async (path: string, editor = 'vscode') => {
      try {
        await launcherService.openInEditor(path, editor)
      } catch (err) {
        console.error('Open editor error:', err)
      }
    },
    []
  )

  const openInTerminal = useCallback(async (path: string) => {
    try {
      await launcherService.openInTerminal(path)
    } catch (err) {
      console.error('Open terminal error:', err)
    }
  }, [])

  const openInFileManager = useCallback(async (path: string) => {
    try {
      await launcherService.openInFileManager(path)
    } catch (err) {
      console.error('Open file manager error:', err)
    }
  }, [])

  const savedProjectIds = new Set(savedProjects.map((p) => p.id))

  const value: ProjectContextType = {
    rootFolders,
    scannedProjects,
    savedProjects,
    pinnedIds,
    isScanning,
    totalScanned,
    scanDurationMs,
    savedProjectIds,
    pickFolder,
    addFolder,
    removeFolder,
    scanFolders,
    clearCache,
    saveProject,
    saveAllProjects,
    removeSavedProject,
    togglePin,
    openInEditor,
    openInTerminal,
    openInFileManager,
  }

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}

export function useProjects(): ProjectContextType {
  const context = useContext(ProjectContext)
  if (context) return context
  // Fallback to Zustand store if called outside provider
  const store = useProjectStore.getState()
  return {
    ...store,
    savedProjectIds: new Set(store.savedProjects.map((p: ProjectInfo) => p.id)),
  } as unknown as ProjectContextType
}
