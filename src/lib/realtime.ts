import { supabase } from './supabase/client'
import { OutreachRow } from './types'

export function subscribeToOutreach(
  onInsert: (row: OutreachRow) => void
): () => void {
  const channel = supabase
    .channel('outreach-feed')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'outreach',
      },
      (payload) => {
        onInsert(payload.new as OutreachRow)
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}
