interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-surface border border-brand-danger/50">
      <span className="text-lg">🔥</span>
      <span className="text-sm font-semibold text-brand-danger">{streak}</span>
    </div>
  )
}
