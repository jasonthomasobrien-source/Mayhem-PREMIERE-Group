'use client'

import { useEffect, useState } from 'react'
import { OutreachRow, Agent } from '@/lib/types'
import { fetchAllOutreachAdmin, fetchAgents, deleteOutreachRecord } from '@/lib/client-queries'
import { LoadingSpinner } from './LoadingSpinner'
import { toast } from '@/lib/toast'

export function LogCorrectionTab() {
  const [rows, setRows] = useState<OutreachRow[]>([])
  const [agents, setAgents] = useState<Record<string, Agent>>({})
  const [loading, setLoading] = useState(true)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [outreachData, agentData] = await Promise.all([
          fetchAllOutreachAdmin(),
          fetchAgents(),
        ])

        setRows(outreachData.slice(0, 100))

        const agentMap = agentData.reduce(
          (acc, agent) => {
            acc[agent.id] = agent
            return acc
          },
          {} as Record<string, Agent>
        )
        setAgents(agentMap)
      } catch (error) {
        console.error('Error loading logs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this log entry?')) {
      return
    }

    try {
      const success = await deleteOutreachRecord(id)
      if (success) {
        setRows(rows.filter((r) => r.id !== id))
        toast('Entry deleted', 'success')
      } else {
        toast('Failed to delete', 'error')
      }
    } catch (error) {
      console.error('Error deleting log:', error)
      toast('Error deleting entry', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-brand-muted">
        Showing the {rows.length} most recent entries
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-semibold text-brand-muted border-b border-brand-muted/20">
              <th className="text-left py-3">Agent</th>
              <th className="text-left py-3">Date</th>
              <th className="text-right py-3">Attempts</th>
              <th className="text-right py-3">Leads</th>
              <th className="text-left py-3">Note</th>
              <th className="text-right py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const agent = agents[row.agent_id]
              return (
                <tr
                  key={row.id}
                  className="border-b border-brand-muted/10 hover:bg-brand-surface/50"
                >
                  <td className="py-3 text-white">
                    {agent?.emoji} {agent?.name || row.agent_id}
                  </td>
                  <td className="py-3 text-white font-mono">{row.activity_date}</td>
                  <td className="py-3 text-right text-white">{row.attempts}</td>
                  <td className="py-3 text-right text-white">{row.leads}</td>
                  <td className="py-3 text-brand-muted text-xs">
                    {row.note || '-'}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-xs text-brand-danger hover:text-brand-danger/80"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="text-center text-brand-muted py-8">No logs yet</p>
      )}
    </div>
  )
}
