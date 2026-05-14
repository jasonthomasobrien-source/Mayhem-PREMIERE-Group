'use client'

import { useEffect, useRef, useState } from 'react'
import { Agent } from '@/lib/types'

interface AgentSearchSelectorProps {
  agents: Agent[]
  selectedAgentId: string
  onAgentChange: (agentId: string) => void
}

export function AgentSearchSelector({
  agents,
  selectedAgentId,
  onAgentChange,
}: AgentSearchSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize selected agent from props
  useEffect(() => {
    const agent = agents.find((a) => a.id === selectedAgentId)
    setSelectedAgent(agent || null)
  }, [agents, selectedAgentId])

  // Filter agents by substring match
  const filteredAgents = inputValue.trim()
    ? agents.filter((agent) =>
        agent.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : agents

  // Auto-select when exactly one agent matches
  useEffect(() => {
    if (filteredAgents.length === 1 && inputValue.trim() && !selectedAgent) {
      handleSelectAgent(filteredAgents[0])
    }
  }, [filteredAgents, inputValue, selectedAgent])

  // Close dropdown on escape or click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleSelectAgent(agent: Agent) {
    setSelectedAgent(agent)
    setInputValue('')
    setIsOpen(false)
    onAgentChange(agent.id)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
    setIsOpen(true)
  }

  function handleInputFocus() {
    setIsOpen(true)
    setInputValue('')
    setSelectedAgent(null)
  }

  return (
    <div className="relative">
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={selectedAgent && !isOpen ? `${selectedAgent.emoji} ${selectedAgent.name}` : inputValue}
        readOnly={false}
        onChange={handleInputChange}
        onFocus={() => {
          if (selectedAgent && !isOpen) {
            handleInputFocus()
          } else if (!isOpen) {
            setIsOpen(true)
          }
        }}
        placeholder="Type your name"
        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
          selectedAgent && !isOpen
            ? 'bg-brand-surface border-brand-gold/30 text-white cursor-pointer'
            : 'bg-brand-surface border-brand-gold text-white placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent'
        }`}
      />

      {/* Dropdown List */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-brand-surface border border-brand-gold/30 rounded-lg shadow-lg z-50"
        >
          {filteredAgents.length === 0 ? (
            <div className="px-4 py-3 text-brand-muted text-sm">
              No matching agents
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {filteredAgents.map((agent) => (
                <li key={agent.id}>
                  <button
                    onClick={() => handleSelectAgent(agent)}
                    className="w-full text-left px-4 py-3 hover:bg-brand-muted/10 transition-colors text-white flex items-center gap-2"
                  >
                    <span>{agent.emoji || '👤'}</span>
                    <span>{agent.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
