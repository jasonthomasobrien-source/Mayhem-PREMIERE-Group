import { getSupabase } from './supabase/client'
import { OutreachRow } from './types'

export function subscribeToOutreach(
  onInsert: (row: OutreachRow) => void
): () => void {
  const supabase = getSupabase()
  const channelName = `outreach-feed-${Math.random()}`

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'outreach',
      },
      (payload: any) => {
        onInsert(payload.new as OutreachRow)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
