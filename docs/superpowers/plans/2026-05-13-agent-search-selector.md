# Agent Search Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dropdown agent selector with a searchable autocomplete input that filters agents by substring match, auto-selects on single match, and persists selection in localStorage.

**Architecture:** New `AgentSearchSelector.tsx` component handles all state (input value, filtered list, dropdown visibility) and localStorage persistence internally. It accepts agents array, selected agent ID, and a callback for changes. The component sits in `src/components/` and is imported into `src/app/page.tsx` to replace the existing shadcn Select.

**Tech Stack:** React hooks (useState, useEffect, useRef), Tailwind CSS, existing types from `src/lib/types.ts`.

---

## File Structure

- **Create:** `src/components/AgentSearchSelector.tsx` — New searchable selector component
- **Modify:** `src/app/page.tsx` — Replace Select with AgentSearchSelector, remove direct localStorage handling
- **Test:** Manual testing (no automated tests needed for this component)

---

## Task 1: Create AgentSearchSelector Component

**Files:**
- Create: `src/components/AgentSearchSelector.tsx`

- [ ] **Step 1: Create the component file with basic structure**

```tsx
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
    localStorage.setItem('mayhem-selected-agent', agent.id)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
    setIsOpen(true)
    setSelectedAgent(null)
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
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder="Type your name"
        readOnly={selectedAgent && !isOpen}
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
                    <span>{agent.emoji}</span>
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
```

- [ ] **Step 2: Commit the new component**

```bash
cd /Users/jasonobrien/Documents/MayHem\ Tracker
git add src/components/AgentSearchSelector.tsx
git commit -m "feat: create AgentSearchSelector component with autocomplete and localStorage"
```

---

## Task 2: Update page.tsx to Use AgentSearchSelector

**Files:**
- Modify: `src/app/page.tsx` (lines 1-15 imports, 18-20 constants, 94-106 selector JSX)

- [ ] **Step 1: Add import for AgentSearchSelector**

In `src/app/page.tsx`, at the top with other imports (after line 10):

```tsx
import { AgentSearchSelector } from '@/components/AgentSearchSelector'
```

- [ ] **Step 2: Remove the Select imports**

Find and remove these lines (around line 7-11):

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
```

The full import block should now be:

```tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { BrandHeader } from '@/components/BrandHeader'
import { LogActivityModal } from '@/components/LogActivityModal'
import { AgentSearchSelector } from '@/components/AgentSearchSelector'
import { RecentActivity } from '@/components/RecentActivity'
import { fetchAgents, fetchOutreach } from '@/lib/client-queries'
import { computeTeamTotals } from '@/lib/aggregates'
import { Agent, OutreachRow } from '@/lib/types'
```

- [ ] **Step 3: Remove AGENT_STORAGE_KEY constant**

Delete line 18:

```tsx
const AGENT_STORAGE_KEY = 'mayhem-selected-agent'
```

The constant is now handled inside `AgentSearchSelector`.

- [ ] **Step 4: Simplify the agent selection initialization in useEffect**

Find the useEffect that starts with `// Load agents and restore selected agent from localStorage` (around line 29-60). Replace the entire agent initialization section with:

```tsx
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentsData, outreachData] = await Promise.all([
          fetchAgents(),
          fetchOutreach(),
        ])

        const activeAgents = agentsData.filter((a) => a.active)
        setAgents(activeAgents)

        // Restore selected agent from localStorage (AgentSearchSelector will handle this on subsequent renders)
        const savedAgentId = localStorage.getItem('mayhem-selected-agent')
        if (savedAgentId && activeAgents.find((a) => a.id === savedAgentId)) {
          setSelectedAgentId(savedAgentId)
        } else if (activeAgents.length > 0) {
          setSelectedAgentId(activeAgents[0].id)
          localStorage.setItem('mayhem-selected-agent', activeAgents[0].id)
        }

        // Calculate team totals
        const totals = computeTeamTotals(outreachData)
        setTeamAttempts(totals.attempts)
        setTeamLeads(totals.leads)
      } catch (error) {
        console.error('Error loading agents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])
```

This keeps the initial localStorage restoration in the page, but `AgentSearchSelector` will handle persistence going forward.

- [ ] **Step 5: Replace the Select JSX with AgentSearchSelector**

Find the agent selector section (lines 94-106) and replace:

```tsx
            {/* Agent Selector */}
            <div className="mb-4">
              <label className="text-sm font-medium text-brand-muted block mb-2">
                Who&apos;s logging?
              </label>
              <AgentSearchSelector
                agents={agents}
                selectedAgentId={selectedAgentId}
                onAgentChange={handleAgentChange}
              />
            </div>
```

- [ ] **Step 6: Verify page.tsx still exports correctly and has no syntax errors**

Run a quick type check:

```bash
cd /Users/jasonobrien/Documents/MayHem\ Tracker
npx tsc --noEmit
```

Expected: No errors (or only pre-existing ones).

- [ ] **Step 7: Commit the updated page.tsx**

```bash
git add src/app/page.tsx
git commit -m "feat: replace Select dropdown with AgentSearchSelector"
```

---

## Task 3: Manual Testing

**No files to modify**

- [ ] **Step 1: Start the development server**

```bash
cd /Users/jasonobrien/Documents/MayHem\ Tracker
npm run dev
```

Expected: Server starts on `http://localhost:3000`

- [ ] **Step 2: Open the app and test basic agent selection**

Go to `http://localhost:3000` and:

1. Click on the input field (should say "Type your name")
2. Type a few characters of an agent's name (e.g., "jas" for Jason)
3. Verify the filtered list appears below with matching agents
4. Verify auto-select fires when only one match remains
5. Verify the selected agent's name + emoji appears in the field
6. Click the field again to re-enter search mode

- [ ] **Step 3: Test localStorage persistence**

1. Select an agent (e.g., Jason O'Brien)
2. Reload the page (Cmd+R or F5)
3. Verify the same agent is pre-selected in the field

- [ ] **Step 4: Test edge cases**

1. Type a non-matching string (e.g., "xyz") → should show "No matching agents"
2. Type slowly and let auto-select fire (e.g., type "j" → "ja" → "jas" until one match) → should auto-select at the right moment
3. Press Escape while dropdown is open → should close dropdown
4. Click outside the dropdown → should close dropdown
5. Test on mobile viewport (use DevTools) → input should feel fast, selections should work on touch

- [ ] **Step 5: Verify the page still functions after selection**

1. Select an agent
2. Verify "Log Activity" button appears and is clickable
3. Verify the button still opens the log modal
4. Verify recent activity feed still loads below

---

## Task 4: Polish & Verification

**No files to modify**

- [ ] **Step 1: Check for console errors**

Open browser DevTools (F12) and verify:
- No red console errors
- No warnings about missing dependencies or types

- [ ] **Step 2: Check alignment with spec**

Review the spec (`docs/superpowers/specs/2026-05-13-agent-search-selector.md`) and verify:

- [x] Substring filtering works
- [x] Auto-select on single match works
- [x] localStorage persistence works
- [x] Dropdown visibility toggles correctly
- [x] Click outside closes dropdown
- [x] Escape closes dropdown
- [x] Field shows emoji + name when selected
- [x] No new dependencies added
- [x] Styling uses brand colors (gold, surface, muted)

- [ ] **Step 3: Stop the dev server**

```bash
# Press Ctrl+C in the terminal running npm run dev
```

---

## Self-Review

**Spec Coverage:**
- ✅ Input field with "Type your name" placeholder (Task 1, Step 1)
- ✅ Substring filtering (Task 1, Step 1, `filteredAgents` logic)
- ✅ Auto-select on single match (Task 1, Step 1, useEffect for auto-select)
- ✅ Dropdown list of matches (Task 1, Step 1, dropdown JSX)
- ✅ Click to select (Task 1, Step 1, `handleSelectAgent`)
- ✅ Escape to close (Task 1, Step 1, keyboard handler)
- ✅ localStorage persistence (Task 1, Step 1, localStorage calls)
- ✅ Display selected agent (Task 1, Step 1, conditional rendering)
- ✅ Integration in page.tsx (Task 2, Steps 1-7)
- ✅ Manual testing (Task 3, Steps 1-5)

**Placeholder Scan:** None found. All code is concrete.

**Type Consistency:** 
- `Agent` type used consistently from `@/lib/types`
- Callback signature matches: `onAgentChange: (agentId: string) => void`
- props destructuring matches interface definition

**No gaps identified.** Plan fully implements the spec.
