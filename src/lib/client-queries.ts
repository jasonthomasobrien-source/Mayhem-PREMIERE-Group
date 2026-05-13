import { Agent, OutreachRow } from './types'

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch('/api/agents')
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

function getAdminPin(): string {
  return localStorage.getItem('admin-pin') || ''
}

function getAdminHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-pin': getAdminPin(),
  }
}

export async function fetchAgentsAdmin(): Promise<Agent[]> {
  const res = await fetch('/api/admin/agents', {
    headers: getAdminHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

export async function fetchOutreach(): Promise<OutreachRow[]> {
  const res = await fetch('/api/outreach')
  if (!res.ok) throw new Error('Failed to fetch outreach')
  return res.json()
}

export async function fetchOutreachByAgent(agentId: string): Promise<OutreachRow[]> {
  const res = await fetch(`/api/outreach?agent_id=${agentId}`)
  if (!res.ok) throw new Error('Failed to fetch outreach')
  return res.json()
}

export async function fetchAllOutreachAdmin(): Promise<OutreachRow[]> {
  const res = await fetch('/api/admin/outreach', {
    headers: getAdminHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch outreach')
  return res.json()
}

export async function insertOutreach(
  records: Omit<OutreachRow, 'id' | 'logged_at'>[]
): Promise<OutreachRow[] | null> {
  const res = await fetch('/api/outreach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(records),
  })
  if (!res.ok) {
    console.error('Failed to insert outreach')
    return null
  }
  return res.json()
}

export async function createAgent(agent: Omit<Agent, 'created_at'>): Promise<Agent | null> {
  const res = await fetch('/api/admin/agents', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(agent),
  })
  if (!res.ok) return null
  return res.json()
}

export async function deleteAgent(agentId: string): Promise<boolean> {
  const res = await fetch(`/api/admin/agents/${agentId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  })
  return res.ok
}

export async function deleteOutreachRecord(recordId: string): Promise<boolean> {
  const res = await fetch(`/api/admin/outreach/${recordId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  })
  return res.ok
}
