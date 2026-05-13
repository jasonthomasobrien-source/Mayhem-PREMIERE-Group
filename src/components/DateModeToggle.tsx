interface DateModeToggleProps {
  mode: 'today' | 'range'
  onChange: (mode: 'today' | 'range') => void
}

export function DateModeToggle({ mode, onChange }: DateModeToggleProps) {
  return (
    <div className="flex gap-2 rounded-lg bg-brand-surface p-1">
      <button
        onClick={() => onChange('today')}
        className={`flex-1 rounded px-4 py-2 font-semibold text-sm transition-colors ${
          mode === 'today'
            ? 'bg-brand-gold-bright text-brand-black'
            : 'bg-transparent text-brand-muted hover:text-white'
        }`}
      >
        Log Today's Activity
      </button>
      <button
        onClick={() => onChange('range')}
        className={`flex-1 rounded px-4 py-2 font-semibold text-sm transition-colors ${
          mode === 'range'
            ? 'bg-brand-gold-bright text-brand-black'
            : 'bg-transparent text-brand-muted hover:text-white'
        }`}
      >
        Log for a Range
      </button>
    </div>
  )
}
