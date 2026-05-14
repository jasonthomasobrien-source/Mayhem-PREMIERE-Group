# Agent Search Selector Design

**Date:** 2026-05-13  
**Goal:** Replace the dropdown agent selector with a searchable autocomplete input that reduces friction and prevents selection mistakes on mobile.

---

## Overview

The current agent selector is a shadcn `Select` dropdown. We'll replace it with a custom `AgentSearchSelector` component that:

- Lets users type their name and filter agents by substring match
- Auto-selects when only one agent matches
- Shows a clean list of matches below the input
- Persists the selection in localStorage across page reloads
- Displays the selected agent's name + emoji once chosen

This is a zero-dependency, ~150-line component that reduces tap count on mobile and prevents typos.

---

## UX Flow

### Initial State
- Input field with placeholder "Type your name"
- Dropdown is hidden
- localStorage restores the previously selected agent (if any)
- Once an agent is selected, the field shows read-only display: `🎯 Jason O'Brien`

### Typing
- User types in the field
- Component filters agents by substring match (case-insensitive)
- Matching agents appear in a dropdown below
- If exactly one agent matches, auto-select them and close dropdown

### Selecting
- User clicks an agent in the dropdown list, or auto-selection fires
- Field updates to show `emoji name` (read-only)
- Dropdown closes
- Parent component (`page.tsx`) receives the `agentId` via callback
- Selection is saved to localStorage

### Clearing / Searching Again
- User can click the field again to re-enter search mode (or use Escape to close dropdown)
- Field clears and re-focuses for a new search

---

## Component API

### `AgentSearchSelector.tsx`

```tsx
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
  // ...
}
```

**Props:**
- `agents`: Array of Agent objects with `id`, `name`, `emoji`
- `selectedAgentId`: Currently selected agent ID (empty string if none)
- `onAgentChange`: Callback fired when selection changes, receives `agentId`

**Behavior:**
- Manages input value, filtered list, and dropdown visibility internally
- Handles localStorage for persistence (key: `mayhem-selected-agent`)
- Auto-selects when filtered list has exactly 1 match
- Closes dropdown on Escape or selection
- Allows re-entry to search mode by clicking the field

---

## Implementation Details

### Filtering Logic
- Filter agents by substring match: `agent.name.toLowerCase().includes(query.toLowerCase())`
- Show full list (all agents) when input is empty
- Auto-select when `filteredAgents.length === 1` (debounce not needed, 12 agents is instant)

### Display Modes
1. **Search mode** (no selection or user re-entered): Input shows user's typed query
2. **Selected mode**: Input shows `emoji name` as read-only text; clicking the field re-enters search mode

### Keyboard & Click Handling
- **Input focus**: Show dropdown (filtered or full list)
- **Input blur**: Close dropdown (but only if user didn't click a list item)
- **Escape**: Close dropdown
- **Click outside**: Close dropdown (standard click-away behavior)
- **Arrow keys** (optional, v2): Navigate list; Enter to select (not in v1)

### Styling
- Gold theme: use `brand-gold-bright` border/focus, `brand-surface` for dropdown background
- Input: Tailwind standard input + gold accents (match existing form inputs in LogActivityModal)
- Dropdown list: positioned absolutely below the input, full width, shadow + border
- Hover state on list items: subtle highlight (brand-muted/20 background)

---

## Integration in `page.tsx`

Replace lines 94–106 (current Select) with:

```tsx
<div className="mb-4">
  <label className="text-sm font-medium text-brand-muted block mb-2">
    Who's logging?
  </label>
  <AgentSearchSelector
    agents={agents}
    selectedAgentId={selectedAgentId}
    onAgentChange={handleAgentChange}
  />
</div>
```

No changes needed to:
- `handleAgentChange` callback
- `selectedAgent` lookup
- localStorage key or logic (moved into the component)

---

## Edge Cases & Validation

1. **Empty agent list**: Show placeholder "No agents available" (shouldn't happen in production)
2. **No matches**: Show "No matching agents" message
3. **Special characters in names**: Substring match handles this naturally (e.g., "O'Brien" matches "o'br")
4. **Multiple agents with same name prefix**: All matching agents show; user types more to disambiguate
5. **Very fast typing + auto-select**: Auto-select uses the latest filtered list (no race conditions at 12 agents)

---

## Testing Checklist

- [ ] Type a partial name → see matching agents
- [ ] Type full name → auto-selects when exact match
- [ ] Type non-matching string → "No matching agents"
- [ ] Select an agent by clicking → field updates, dropdown closes
- [ ] Reload page → previously selected agent is restored
- [ ] Click field again → re-enters search mode
- [ ] Escape key → closes dropdown
- [ ] Click outside dropdown → closes dropdown
- [ ] Mobile: tap field → keyboard appears, type name → selections feel fast

---

## Out of Scope (v1)

- Arrow key navigation / keyboard-only selection
- Fuzzy matching (substring is sufficient)
- Agent search history or favorites
- Accessibility announcements for screen readers (will add in v2 if needed)

