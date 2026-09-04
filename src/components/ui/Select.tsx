import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SelectProps<T extends string = string> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  icon?: React.ReactNode
  className?: string
  placeholder?: string
}

export function Select<T extends string = string>({
  value,
  options,
  onChange,
  icon,
  className = '',
  placeholder,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11172c] hover:bg-[#151c35] border border-white/10 hover:border-white/20 text-xs font-medium text-slate-200 transition-colors duration-150 cursor-pointer select-none focus:outline-none focus:border-indigo-500/50'
        aria-haspopup='listbox'
        aria-expanded={isOpen}
      >
        {icon && <span className='text-slate-400 flex-shrink-0'>{icon}</span>}
        <span className='truncate'>{selectedOption?.label || placeholder || 'Select'}</span>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-150 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role='listbox'
          className='absolute right-0 top-full mt-1.5 min-w-[180px] bg-[#0d1322] border border-white/10 rounded-xl p-1 shadow-2xl shadow-black/80 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-100'
        >
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                type='button'
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                role='option'
                aria-selected={isSelected}
              >
                <div className='flex items-center gap-2 truncate'>
                  {option.icon && <span>{option.icon}</span>}
                  <span className='truncate'>{option.label}</span>
                </div>
                {isSelected && <Check size={13} className='text-indigo-400 flex-shrink-0' />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
