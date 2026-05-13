import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  disabled?: boolean
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 200,
  label,
  disabled = false,
}: NumberStepperProps) {
  const decrement = () => {
    const newValue = Math.max(min, value - 1)
    onChange(newValue)
  }

  const increment = () => {
    const newValue = Math.min(max, value + 1)
    onChange(newValue)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    if (input === '') {
      onChange(min)
      return
    }
    const num = parseInt(input, 10)
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)))
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={decrement}
        disabled={disabled || value <= min}
        className="h-9 w-9 p-0 border-brand-gold text-brand-gold hover:bg-brand-surface"
      >
        −
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInput}
        disabled={disabled}
        min={min}
        max={max}
        className="h-9 w-16 text-center border-brand-muted/30 bg-brand-surface text-white"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={increment}
        disabled={disabled || value >= max}
        className="h-9 w-9 p-0 border-brand-gold text-brand-gold hover:bg-brand-surface"
      >
        +
      </Button>
    </div>
  )
}
