import { formatConversion } from '@/lib/dates'
import { cn } from '@/lib/utils'

interface ConversionPillProps {
  attempts: number
  leads: number
  className?: string
}

export function ConversionPill({
  attempts,
  leads,
  className,
}: ConversionPillProps) {
  const percentage = formatConversion(attempts, leads)
  const rate = attempts > 0 ? (leads / attempts) : 0
  const isGood = rate >= 0.1 // 10% threshold

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold',
        isGood
          ? 'bg-brand-success/10 text-brand-success'
          : 'bg-brand-muted/10 text-brand-muted',
        className
      )}
    >
      {percentage}%
    </span>
  )
}
