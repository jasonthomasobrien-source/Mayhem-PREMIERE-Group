import { toast as showToast } from '@/hooks/use-toast'

export function toast(message: string, type: 'success' | 'error' | 'default' = 'default') {
  const variant = type === 'error' ? 'destructive' : 'default'
  showToast({
    title: message,
    variant,
  })
}
