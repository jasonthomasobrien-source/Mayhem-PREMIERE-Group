import { supabaseAdmin } from './supabase/server'
import { getSupabase } from './supabase/client'
import { Agent, OutreachRow, SprintConfig } from './types'

// Fetch all agents
export async function fetchAgents(): Promise<Agent[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('agents').select('*')

  if (error) {
    console.error('Error fetching agents:', error)
    return []
  }

  return data || []
}

// Fetch all outreach records
export async function fetchOutreach(): Promise<OutreachRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('outreach')
    .select('*')
    .order('logged_at', { ascending: false })

  if (error) {
    console.error('Error fetching outreach:', error)
    return []
  }

  return data || []
}

// Fetch outreach for a specific date range
export async function fetchOutreachByDateRange(
  startDate: string,
  endDate: string
): Promise<OutreachRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('outreach')
    .select('*')
    .gte('activity_date', startDate)
    .lte('activity_date', endDate)
    .order('logged_at', { ascending: false })

  if (error) {
    console.error('Error fetching outreach by date range:', error)
    return []
  }

  return data || []
}

// Fetch outreach for a specific agent
export async function fetchOutreachByAgent(agentId: string): Promise<OutreachRow[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('outreach')
    .select('*')
    .eq('agent_id', agentId)
    .order('activity_date', { ascending: false })

  if (error) {
    console.error('Error fetching outreach for agent:', error)
    return []
  }

  return data || []
}

// Fetch sprint config
export async function fetchSprintConfig(): Promise<SprintConfig | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('sprint_config').select('*').eq('id', 1).single()

  if (error) {
    console.error('Error fetching sprint config:', error)
    return null
  }

  return data || null
}

// Insert one or more outreach records
export async function insertOutreach(
  records: Omit<OutreachRow, 'id' | 'logged_at'>[]
): Promise<OutreachRow[] | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('outreach').insert(records).select()

  if (error) {
    console.error('Error inserting outreach:', error)
    return null
  }

  return data || []
}

// Admin: Fetch all agents (server-side)
export async function fetchAgentsAdmin(): Promise<Agent[]> {
  const { data, error } = await supabaseAdmin.from('agents').select('*')

  if (error) {
    console.error('Error fetching agents (admin):', error)
    return []
  }

  return data || []
}

// Admin: Update an agent
export async function updateAgent(
  agentId: string,
  updates: Partial<Agent>
): Promise<Agent | null> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating agent:', error)
    return null
  }

  return data || null
}

// Admin: Create a new agent
export async function createAgent(agent: Omit<Agent, 'created_at'>): Promise<Agent | null> {
  const { data, error } = await supabaseAdmin.from('agents').insert([agent]).select().single()

  if (error) {
    console.error('Error creating agent:', error)
    return null
  }

  return data || null
}

// Admin: Delete an agent
export async function deleteAgent(agentId: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('agents').delete().eq('id', agentId)

  if (error) {
    console.error('Error deleting agent:', error)
    return false
  }

  return true
}

// Admin: Fetch all outreach (for export/review)
export async function fetchAllOutreachAdmin(): Promise<OutreachRow[]> {
  const { data, error } = await supabaseAdmin
    .from('outreach')
    .select('*')
    .order('logged_at', { ascending: false })

  if (error) {
    console.error('Error fetching all outreach (admin):', error)
    return []
  }

  return data || []
}

// Admin: Update sprint config
export async function updateSprintConfig(updates: Partial<SprintConfig>): Promise<SprintConfig | null> {
  const { data, error } = await supabaseAdmin
    .from('sprint_config')
    .update(updates)
    .eq('id', 1)
    .select()
    .single()

  if (error) {
    console.error('Error updating sprint config:', error)
    return null
  }

  return data || null
}

// Admin: Delete outreach record
export async function deleteOutreachRecord(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('outreach').delete().eq('id', id)

  if (error) {
    console.error('Error deleting outreach:', error)
    return false
  }

  return true
}

// Fetch all outreach (alias for fetchAllOutreachAdmin for consistency)
export async function fetchAllOutreach(): Promise<OutreachRow[]> {
  return fetchAllOutreachAdmin()
}
