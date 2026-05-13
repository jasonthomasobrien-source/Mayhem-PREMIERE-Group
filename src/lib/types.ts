export type Agent = {
  id: string           // slug, e.g. 'jason-obrien'
  name: string
  emoji: string | null
  active: boolean
  created_at: string   // ISO timestamp
}

export type OutreachRow = {
  id: string           // UUID
  agent_id: string
  activity_date: string  // ISO date, e.g. '2026-05-13'
  attempts: number
  leads: number
  note: string | null
  logged_at: string    // ISO timestamp
}

export type SprintConfig = {
  id: number           // Always 1
  name: string
  start_date: string   // ISO date
  end_date: string     // ISO date
  daily_goal: number   // 5
  weekly_goal: number  // 25
}

// Computed types
export type AgentStats = {
  agent: Agent
  totalAttempts: number
  totalLeads: number
  conversionRate: number  // 0.0 - 1.0
  streak: number          // consecutive days >= 5 attempts
  currentWeekAttempts: number
  onPace: boolean         // true if current week >= 25
}

export type LeaderboardRow = AgentStats & {
  rank: number
  todayAttempts: number
  todayLeads: number
  weekAttempts: number
  weekLeads: number
  sprintAttempts: number
  sprintLeads: number
}

// Supabase Database type definition
export type Database = {
  public: {
    Tables: {
      agents: {
        Row: Agent
        Insert: Omit<Agent, 'created_at'>
        Update: Partial<Omit<Agent, 'created_at'>>
      }
      outreach: {
        Row: OutreachRow
        Insert: Omit<OutreachRow, 'id' | 'logged_at'>
        Update: never
      }
      sprint_config: {
        Row: SprintConfig
        Insert: SprintConfig
        Update: Partial<SprintConfig>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
