import { useState } from 'react'
import { NavTab } from '@/types/project'
import { ProjectProvider } from '@/context/ProjectContext'
import { AppLayout } from '@/layout/AppLayout'
import { ProjectsView } from '@/features/projects/ProjectsView'
import { ScanView } from '@/features/scanner/ScanView'
import { SettingsView } from '@/features/settings/SettingsView'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Toaster } from 'sonner'
import './App.css'

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('projects')

  // Global hotkeys (⌘K to focus search, Esc to blur/close)
  useKeyboardShortcuts()

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === 'projects' && (
        <ProjectsView onNavigateToScan={() => setActiveTab('scan')} />
      )}
      {activeTab === 'scan' && <ScanView />}
      {activeTab === 'settings' && <SettingsView />}
      <Toaster theme="dark" position="bottom-right" richColors />
    </AppLayout>
  )
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  )
}

export default App
