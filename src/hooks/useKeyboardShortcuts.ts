import { useEffect } from 'react'

interface ShortcutHandlers {
  onSearchFocus?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts({ onSearchFocus, onEscape }: ShortcutHandlers = {}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K -> Focus search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (onSearchFocus) {
          onSearchFocus()
        } else {
          const searchInput =
            document.querySelector<HTMLInputElement>('input[data-search-input]') ||
            document.querySelector<HTMLInputElement>('input[type="text"]')
          searchInput?.focus()
          searchInput?.select()
        }
      }

      // Escape -> Close modals / blur active element
      if (e.key === 'Escape') {
        if (onEscape) {
          onEscape()
        } else if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSearchFocus, onEscape])
}
