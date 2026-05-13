'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { subscribeToOutreach } from '@/lib/realtime'
import { fetchOutreach, fetchAgents } from '@/lib/queries'
import { OutreachRow, Agent } from '@/lib/types'

export function RecentActivity() {
  const [activities, setActivities] = useState<OutreachRow[]>([])
  const [agents, setAgents] = useState<Record<string, Agent>>({})
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [outreachData, agentData] = await Promise.all([
          fetchOutreach(),
          fetchAgents(),
        ])

        // Map agents by ID for quick lookup
        const agentMap = agentData.reduce(
          (acc, agent) => {
            acc[agent.id] = agent
            return acc
          },
          {} as Record<string, Agent>
        )

        setAgents(agentMap)
        setActivities(outreachData.slice(0, 15))
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Subscribe to new entries
  useEffect(() => {
    const unsubscribe = subscribeToOutreach((newRow: OutreachRow) => {
      setActivities((prev) => [newRow, ...prev].slice(0, 15))
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="text-center py-4 text-brand-muted">
        Loading activity...
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-4 text-brand-muted">
        No activity yet. Be the first to log!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white mb-4">Recent activity</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.map((activity) => {
          const agent = agents[activity.agent_id]
          const timeAgo = formatDistanceToNow(new Date(activity.logged_at), {
            addSuffix: true,
          })

          return (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-md bg-brand-surface/50 border border-brand-muted/20 hover:border-brand-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">
                  {agent?.emoji || '👤'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">
                    {agent?.name || activity.agent_id}
                  </p>
                  <p className="text-xs text-brand-muted">
                    +{activity.attempts} outreach
                    {activity.leads > 0 && `, +${activity.leads} lead${activity.leads > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <p className="text-xs text-brand-muted flex-shrink-0 ml-2">
                {timeAgo}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
