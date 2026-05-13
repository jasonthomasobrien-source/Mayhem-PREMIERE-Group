'use client'

import { Button } from '@/components/ui/button'

interface DateModeToggleProps {
  mode: 'single' | 'range'
  onChange: (mode: 'single' | 'range') => void
}

export function DateModeToggle({ mode, onChange }: DateModeToggleProps) {
  return (
    <div className="flex gap-2 rounded-md border border-brand-muted p-1 bg-brand-surface/50">
      <Button
        variant={mode === 'single' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('single')}
        className="flex-1"
      >
        Single day
      </Button>
      <Button
        variant={mode === 'range' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('range')}
        className="flex-1"
      >
        Date range
      </Button>
    </div>
  )
}
