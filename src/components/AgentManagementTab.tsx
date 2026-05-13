'use client'

import { useEffect, useState } from 'react'
import { Agent } from '@/lib/types'
import { fetchAgentsAdmin, createAgent, deleteAgent } from '@/lib/queries'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { LoadingSpinner } from './LoadingSpinner'
import { toast } from '@/lib/toast'

export function AgentManagementTab() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await fetchAgentsAdmin()
        setAgents(data)
      } catch (error) {
        console.error('Error loading agents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newId || !newName) {
      toast('Please fill in all fields', 'error')
      return
    }

    setSubmitting(true)
    try {
      const agent = await createAgent({
        id: newId,
        name: newName,
        emoji: newEmoji || null,
        active: true,
      })

      if (agent) {
        setAgents([...agents, agent])
        setNewId('')
        setNewName('')
        setNewEmoji('')
        toast('Agent added successfully', 'success')
      } else {
        toast('Failed to add agent', 'error')
      }
    } catch (error) {
      console.error('Error adding agent:', error)
      toast('Error adding agent', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure? This will mark the agent as inactive.')) {
      return
    }

    try {
      const success = await deleteAgent(agentId)
      if (success) {
        setAgents(agents.filter((a) => a.id !== agentId))
        toast('Agent deleted', 'success')
      } else {
        toast('Failed to delete agent', 'error')
      }
    } catch (error) {
      console.error('Error deleting agent:', error)
      toast('Error deleting agent', 'error')
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
    <div className="space-y-6">
      {/* Add Agent Form */}
      <div className="bg-brand-surface rounded-lg p-6 border border-brand-muted/20">
        <h3 className="text-lg font-semibold text-white mb-4">Add new agent</h3>
        <form onSubmit={handleAddAgent} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Agent ID (slug)"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              disabled={submitting}
            />
            <Input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={submitting}
            />
            <Input
              placeholder="Emoji (optional)"
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              maxLength={2}
              disabled={submitting}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Agent'}
          </Button>
        </form>
      </div>

      {/* Agents Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-semibold text-brand-muted border-b border-brand-muted/20">
              <th className="text-left py-3">ID</th>
              <th className="text-left py-3">Name</th>
              <th className="text-left py-3">Emoji</th>
              <th className="text-center py-3">Status</th>
              <th className="text-right py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className="border-b border-brand-muted/10 hover:bg-brand-surface/50"
              >
                <td className="py-3 text-white font-mono">{agent.id}</td>
                <td className="py-3 text-white">{agent.name}</td>
                <td className="py-3 text-lg">{agent.emoji || '-'}</td>
                <td className="py-3 text-center">
                  <span
                    className={`text-xs font-semibold ${
                      agent.active
                        ? 'text-brand-success'
                        : 'text-brand-danger'
                    }`}
                  >
                    {agent.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="text-xs text-brand-danger hover:text-brand-danger/80"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {agents.length === 0 && (
        <p className="text-center text-brand-muted py-8">No agents yet</p>
      )}
    </div>
  )
}
