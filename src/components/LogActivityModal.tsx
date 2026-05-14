'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DateModeToggle } from './DateModeToggle'
import { NumberStepper } from './NumberStepper'
import { useToast } from '@/hooks/use-toast'
import { insertOutreach } from '@/lib/client-queries'
import { todayDetroit, dateToISO } from '@/lib/dates'
import { OutreachRow } from '@/lib/types'

const SPRINT_START_DATE = new Date('2026-05-10')

interface LogActivityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
  agentName: string
  agentEmoji: string
}

/**
 * Distribute attempts and leads evenly across days.
 * For simplicity, divides evenly; remainder goes to first day.
 */
function distributeAcrossDays(
  totalAttempts: number,
  totalLeads: number,
  numDays: number
): Array<{ attempts: number; leads: number }> {
  const result: Array<{ attempts: number; leads: number }> = []

  const attemptsPerDay = Math.floor(totalAttempts / numDays)
  const leadsPerDay = Math.floor(totalLeads / numDays)
  const attemptsRemainder = totalAttempts % numDays
  const leadsRemainder = totalLeads % numDays

  for (let i = 0; i < numDays; i++) {
    result.push({
      attempts: attemptsPerDay + (i < attemptsRemainder ? 1 : 0),
      leads: leadsPerDay + (i < leadsRemainder ? 1 : 0),
    })
  }

  return result
}

export function LogActivityModal({
  open,
  onOpenChange,
  agentId,
  agentName,
  agentEmoji,
}: LogActivityModalProps) {
  const [mode, setMode] = useState<'today' | 'range'>('today')
  const [attempts, setAttempts] = useState(5)
  const [leads, setLeads] = useState(0)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const today = todayDetroit()
  const sprintStart = SPRINT_START_DATE
  const todayStr = dateToISO(today)
  const sprintStartStr = dateToISO(sprintStart)

  // Initialize dates on open
  useEffect(() => {
    if (open && !startDate) {
      setStartDate(todayStr)
      setEndDate(todayStr)
    }
  }, [open, startDate, todayStr])

  const numDays = useMemo(() => {
    if (mode === 'today') return 1
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }, [mode, startDate, endDate])

  const validate = (): boolean => {
    setError('')

    if (attempts + leads === 0) {
      setError('Attempts + leads must be greater than 0')
      return false
    }

    if (attempts < 0 || leads < 0) {
      setError('Attempts and leads cannot be negative')
      return false
    }

    if (mode === 'range') {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const todayDate = today

      if (start < sprintStart) {
        setError(`Start date cannot be before sprint start (${sprintStart.toDateString()})`)
        return false
      }

      if (end > todayDate) {
        setError('End date cannot be in the future')
        return false
      }

      if (start > end) {
        setError('Start date must be before or equal to end date')
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const rowsToInsert: Omit<OutreachRow, 'id' | 'logged_at'>[] = []

      if (mode === 'today') {
        rowsToInsert.push({
          agent_id: agentId,
          activity_date: todayStr,
          attempts,
          leads,
          note: null,
        })
      } else {
        const distribution = distributeAcrossDays(attempts, leads, numDays)
        const start = new Date(startDate)

        for (let i = 0; i < numDays; i++) {
          const date = new Date(start)
          date.setDate(date.getDate() + i)
          const dateStr = dateToISO(date)
          const { attempts: dayAttempts, leads: dayLeads } = distribution[i]

          rowsToInsert.push({
            agent_id: agentId,
            activity_date: dateStr,
            attempts: dayAttempts,
            leads: dayLeads,
            note: null,
          })
        }
      }

      await insertOutreach(rowsToInsert)

      const toastMsg =
        mode === 'today'
          ? `Logged ${attempts} outreach for ${agentEmoji} ${agentName}`
          : `Logged ${attempts} outreach for ${agentEmoji} ${agentName} across ${startDate}–${endDate}`

      toast({
        title: 'Success',
        description: toastMsg,
      })

      onOpenChange(false)
      setAttempts(5)
      setLeads(0)
      setError('')
    } catch (err) {
      setError('Failed to log activity. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-brand-surface border-brand-muted/20">
        <DialogHeader>
          <DialogTitle className="text-white">Log Activity</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <DateModeToggle mode={mode} onChange={setMode} />

          {/* Today Mode */}
          {mode === 'today' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Date</label>
                <div className="bg-brand-black border border-brand-muted/20 rounded px-3 py-2 text-sm text-white">
                  {today.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  (Today)
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Outreach Attempts</label>
                <NumberStepper value={attempts} onChange={setAttempts} max={200} />
              </div>

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Leads Generated (optional)</label>
                <NumberStepper value={leads} onChange={setLeads} max={50} />
              </div>
            </div>
          )}

          {/* Range Mode */}
          {mode === 'range' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={sprintStartStr}
                  max={todayStr}
                  className="bg-brand-black border-brand-muted/20 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || sprintStartStr}
                  max={todayStr}
                  className="bg-brand-black border-brand-muted/20 text-white"
                />
              </div>

              {numDays > 0 && (
                <div className="text-xs text-brand-muted">→ {numDays} day{numDays !== 1 ? 's' : ''}</div>
              )}

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Total Outreach Attempts</label>
                <NumberStepper value={attempts} onChange={setAttempts} max={200} />
                <p className="text-xs text-brand-muted mt-1">(across {numDays} day{numDays !== 1 ? 's' : ''})</p>
              </div>

              <div>
                <label className="text-sm font-medium text-brand-muted block mb-2">Total Leads (optional)</label>
                <NumberStepper value={leads} onChange={setLeads} max={50} />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="text-sm text-brand-danger">{error}</div>}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 border-brand-muted/20 text-brand-muted hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-brand-gold-bright text-brand-black hover:bg-brand-gold"
            >
              {loading ? 'Logging...' : `Log ${attempts} Attempt${attempts !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
