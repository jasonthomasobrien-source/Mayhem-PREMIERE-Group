import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types'

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabase(): ReturnType<typeof createClient<Database>> {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    // For now, create a client even with empty keys to avoid bundling errors
    // The actual error will happen at runtime when queries are called if keys are missing
    try {
      supabaseInstance = createClient<Database>(url, key)
    } catch (e) {
      // Silently fail during initialization; the error will surface when methods are called
      console.error('Failed to initialize Supabase:', e)
      // Create a dummy client to satisfy the type system
      supabaseInstance = createClient<Database>('', '')
    }
  }
  return supabaseInstance
}

export const supabase = {}
