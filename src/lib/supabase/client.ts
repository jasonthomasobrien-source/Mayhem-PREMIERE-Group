import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types'

// Create supabase client - use defaults during build, real values at runtime
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient<Database>(url, key)
