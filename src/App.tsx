import { useProjectStore } from '@/stores/useProjectStore'
import { AppLayout } from '@/layout/AppLayout'
import { ProjectsView } from '@/features/projects/ProjectsView'
import { ScanView } from '@/features/scanner/ScanView'
import { SettingsView } from '@/features/settings/SettingsView'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Toaster } from 'sonner'
import './App.css'

export default function App() {
  const activeTab = useProjectStore((s) => s.activeTab)
  const setActiveTab = useProjectStore((s) => s.setActiveTab)

  // Global hotkeys (⌘K to focus search, Esc to blur/close)
  useKeyboardShortcuts()

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === 'projects' && (
        <ProjectsView onNavigateToScan={() => setActiveTab('scan')} />
      )}
      {activeTab === 'scan' && <ScanView />}
      {activeTab === 'settings' && <SettingsView />}
      <Toaster
        theme="dark"
        position="bottom-right"
        closeButton
        toastOptions={{
          className: 'rounded-xl font-sans text-sm shadow-[0_12px_40px_rgba(0,0,0,0.6)] border',
          classNames: {
            toast: 'bg-[#12182b] text-slate-100 border-white/20',
            title: 'text-white text-sm font-semibold',
            description: 'text-slate-300 text-xs',
            closeButton:
              '!bg-[#182038] !text-slate-300 hover:!text-white !border !border-white/20',
            success:
              '!bg-[#0b1f1a] !border-emerald-500/60 !text-emerald-200 !shadow-[0_8px_32px_rgba(16,185,129,0.25)]',
            info: '!bg-[#131b38] !border-indigo-500/60 !text-indigo-200 !shadow-[0_8px_32px_rgba(99,102,241,0.25)]',
            warning:
              '!bg-[#26190a] !border-amber-500/60 !text-amber-200 !shadow-[0_8px_32px_rgba(245,158,11,0.25)]',
            error:
              '!bg-[#260e14] !border-rose-500/60 !text-rose-200 !shadow-[0_8px_32px_rgba(244,63,94,0.25)]',
          },
        }}
      />
    </AppLayout>
  )
}
