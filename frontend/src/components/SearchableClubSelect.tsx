import { useState, useRef, useEffect } from 'react'
import type { Club } from '../types'

interface SearchableClubSelectProps {
  clubs: Club[]
  selectedClubId: number | null
  onSelect: (clubId: number) => void
  label?: string
  className?: string
  disabled?: boolean
}

export function SearchableClubSelect({
  clubs,
  selectedClubId,
  onSelect,
  label = 'انتخاب باشگاه',
  className = '',
  disabled = false,
}: SearchableClubSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedClub = clubs.find((c) => c.id === selectedClubId)

  // Filter clubs based on search query
  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset highlighted index when filtered clubs change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredClubs.length, searchQuery])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (isOpen && filteredClubs[highlightedIndex]) {
          handleSelect(filteredClubs[highlightedIndex].id)
        } else {
          setIsOpen(true)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex((prev) => (prev < filteredClubs.length - 1 ? prev + 1 : prev))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchQuery('')
        inputRef.current?.blur()
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [highlightedIndex, isOpen])

  const handleSelect = (clubId: number) => {
    onSelect(clubId)
    setIsOpen(false)
    setSearchQuery('')
    inputRef.current?.blur()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const displayValue = selectedClub ? `${selectedClub.name} - ${selectedClub.city}` : ''

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-slate-400 text-sm mb-2" dir="rtl">
          {label}
        </label>
      )}
      <div className="relative max-w-md">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={selectedClub ? undefined : 'جستجو یا انتخاب باشگاه...'}
          className="input-field w-full pl-10"
          dir="rtl"
        />
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen)
              if (!isOpen) {
                inputRef.current?.focus()
              }
            }
          }}
          disabled={disabled}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Toggle dropdown"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 max-w-md w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto"
          dir="rtl"
        >
          {filteredClubs.length === 0 ? (
            <div className="px-4 py-3 text-slate-400 text-sm text-center">باشگاهی یافت نشد</div>
          ) : (
            filteredClubs.map((club, index) => (
              <button
                key={club.id}
                type="button"
                onClick={() => handleSelect(club.id)}
                className={`w-full text-right px-4 py-3 hover:bg-slate-700 transition-colors ${
                  club.id === selectedClubId ? 'bg-primary-500/20 text-primary-400' : 'text-white'
                } ${
                  index === highlightedIndex ? 'bg-slate-700' : ''
                } ${index === 0 ? 'rounded-t-lg' : ''} ${
                  index === filteredClubs.length - 1 ? 'rounded-b-lg' : ''
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="font-medium">{club.name}</div>
                <div className="text-sm text-slate-400">{club.city}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

