interface BadgePillProps {
  type: 'streak' | 'on-pace' | 'off-pace' | 'mvp' | 'conversion'
  value?: string | number
  icon?: string
}

export function BadgePill({ type, value, icon }: BadgePillProps) {
  const styles: Record<string, string> = {
    streak: 'bg-brand-gold/20 text-brand-gold',
    'on-pace': 'bg-brand-success/20 text-brand-success',
    'off-pace': 'bg-brand-danger/20 text-brand-danger',
    mvp: 'bg-brand-gold/20 text-brand-gold',
    conversion: 'bg-brand-gold/20 text-brand-gold',
  }

  const labels: Record<string, string> = {
    streak: '',
    'on-pace': 'On pace',
    'off-pace': 'Off pace',
    mvp: '👑 MVP',
    conversion: '👑 Conversion',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${styles[type]}`}>
      {icon && <span>{icon}</span>}
      {type === 'streak' && value ? (
        <>
          <span>🔥</span>
          <span>{value}</span>
        </>
      ) : (
        labels[type]
      )}
    </span>
  )
}
