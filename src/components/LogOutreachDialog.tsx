'use client'

import { useState } from 'react'
import { eachDayOfInterval, subDays } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { insertOutreach } from '@/lib/client-queries'
import {
  todayDetroit,
  dateToISO,
  parseDate,
  isWithinSprintWindow,
  isNotInFuture,
  formatDate,
} from '@/lib/dates'
import { NumberStepper } from './NumberStepper'
import { DateModeToggle } from './DateModeToggle'
import { LoadingSpinner } from './LoadingSpinner'
import { Calendar } from '@/components/ui/calendar'

interface LogOutreachDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
  agentName: string
  agentEmoji?: string | null
}

export function LogOutreachDialog({
  open,
  onOpenChange,
  agentId,
  agentName,
  agentEmoji,
}: LogOutreachDialogProps) {
  const { toast } = useToast()
  const [mode, setMode] = useState<'today' | 'range'>('today')
  const [singleDate, setSingleDate] = useState<Date>(todayDetroit())
  const [rangeStart, setRangeStart] = useState<Date>(todayDetroit())
  const [rangeEnd, setRangeEnd] = useState<Date>(todayDetroit())
  const [attempts, setAttempts] = useState(5)
  const [leads, setLeads] = useState(0)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState<'single' | 'start' | 'end'>('single')

  const handleModeChange = (newMode: 'today' | 'range') => {
    setMode(newMode)
    if (newMode === 'range') {
      const today = todayDetroit()
      const weekAgo = subDays(today, 6)
      setRangeStart(weekAgo)
      setRangeEnd(today)
    }
  }

  const getSelectedDates = () => {
    if (mode === 'today') {
      return [singleDate]
    }
    try {
      return eachDayOfInterval({
        start: rangeStart,
        end: rangeEnd,
      })
    } catch {
      return []
    }
  }

  const selectedDates = getSelectedDates()
  const dayCount = selectedDates.length
  const totalAttempts = attempts * dayCount
  const totalLeads = leads * dayCount

  const validateForm = (): string | null => {
    const dates = mode === 'today' ? [singleDate] : [rangeStart, rangeEnd]

    for (const date of dates) {
      if (!isWithinSprintWindow(date)) {
        return 'Date must be within sprint window (May 10 - June 30, 2026)'
      }
      if (!isNotInFuture(date)) {
        return 'Cannot log future dates'
      }
    }

    if (mode === 'range' && rangeStart > rangeEnd) {
      return 'Start date must be before end date'
    }

    if (attempts + leads <= 0) {
      return 'Must log at least one attempt or lead'
    }

    return null
  }

  const handleSubmit = async () => {
    const error = validateForm()
    if (error) {
      toast({
        title: 'Validation error',
        description: error,
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const perDayAttempts = dayCount > 1 ? Math.floor(attempts / dayCount) : attempts
      const perDayLeads = dayCount > 1 ? Math.floor(leads / dayCount) : leads

      const records = selectedDates.map((date) => ({
        agent_id: agentId,
        activity_date: dateToISO(date),
        attempts: perDayAttempts,
        leads: perDayLeads,
        note: note || null,
      }))

      const result = await insertOutreach(records)

      if (result && result.length > 0) {
        const dateRange =
          mode === 'today'
            ? formatDate(singleDate)
            : `${formatDate(rangeStart)}–${formatDate(rangeEnd)}`

        toast({
          title: 'Logged successfully',
          description: `Logged ${totalAttempts} outreach${totalLeads > 0 ? ` and ${totalLeads} leads` : ''} for ${agentEmoji ? agentEmoji + ' ' : ''}${agentName} across ${dateRange}`,
          variant: 'default',
        })

        // Reset form
        setMode('today')
        setSingleDate(todayDetroit())
        setRangeStart(todayDetroit())
        setRangeEnd(todayDetroit())
        setAttempts(5)
        setLeads(0)
        setNote('')
        onOpenChange(false)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to log outreach',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error logging outreach:', error)
      toast({
        title: 'Error',
        description: 'Failed to log outreach',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Outreach</DialogTitle>
          <DialogDescription>
            Record outreach activities for {agentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Agent display */}
          <div>
            <label className="text-sm font-medium text-white block mb-2">
              Agent
            </label>
            <div className="px-3 py-2 rounded-md bg-brand-surface border border-brand-muted text-white">
              {agentEmoji} {agentName}
            </div>
          </div>

          {/* Date mode toggle */}
          <div>
            <label className="text-sm font-medium text-white block mb-2">
              Date
            </label>
            <DateModeToggle mode={mode} onChange={handleModeChange} />
          </div>

          {/* Date picker - single mode */}
          {mode === 'today' && (
            <div>
              <label className="text-sm font-medium text-white block mb-2">
                Date
              </label>
              <button
                onClick={() => {
                  setDatePickerMode('single')
                  setShowDatePicker(true)
                }}
                className="w-full px-3 py-2 rounded-md bg-brand-surface border border-brand-muted text-white text-left flex items-center justify-between"
              >
                <span>{formatDate(singleDate)}</span>
                <CalendarIcon className="h-4 w-4" style={{ color: '#D4AF54' }} />
              </button>
              {showDatePicker && datePickerMode === 'single' && (
                <div className="mt-2 p-2 border border-brand-muted rounded-md bg-brand-black">
                  <Calendar
                    mode="single"
                    selected={singleDate}
                    onSelect={(date) => {
                      if (date) setSingleDate(date)
                      setShowDatePicker(false)
                    }}
                    disabled={(date) => !isWithinSprintWindow(date)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Date picker - range mode */}
          {mode === 'range' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-white block mb-2">
                  From
                </label>
                <button
                  onClick={() => {
                    setDatePickerMode('start')
                    setShowDatePicker(true)
                  }}
                  className="w-full px-3 py-2 rounded-md bg-brand-surface border border-brand-muted text-white text-left flex items-center justify-between"
                >
                  <span>{formatDate(rangeStart)}</span>
                  <CalendarIcon className="h-4 w-4" style={{ color: '#D4AF54' }} />
                </button>
                {showDatePicker && datePickerMode === 'start' && (
                  <div className="mt-2 p-2 border border-brand-muted rounded-md bg-brand-black">
                    <Calendar
                      mode="single"
                      selected={rangeStart}
                      onSelect={(date) => {
                        if (date) setRangeStart(date)
                        setShowDatePicker(false)
                      }}
                      disabled={(date) => !isWithinSprintWindow(date)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-white block mb-2">
                  To
                </label>
                <button
                  onClick={() => {
                    setDatePickerMode('end')
                    setShowDatePicker(true)
                  }}
                  className="w-full px-3 py-2 rounded-md bg-brand-surface border border-brand-muted text-white text-left flex items-center justify-between"
                >
                  <span>{formatDate(rangeEnd)}</span>
                  <CalendarIcon className="h-4 w-4" style={{ color: '#D4AF54' }} />
                </button>
                {showDatePicker && datePickerMode === 'end' && (
                  <div className="mt-2 p-2 border border-brand-muted rounded-md bg-brand-black">
                    <Calendar
                      mode="single"
                      selected={rangeEnd}
                      onSelect={(date) => {
                        if (date) setRangeEnd(date)
                        setShowDatePicker(false)
                      }}
                      disabled={(date) => !isWithinSprintWindow(date)}
                    />
                  </div>
                )}
              </div>

              {dayCount > 0 && (
                <div className="text-sm text-brand-muted bg-brand-surface/50 p-2 rounded">
                  → {dayCount} day{dayCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {/* Attempts */}
          <div>
            <label className="text-sm font-medium text-white block mb-2">
              Outreach attempts
              {mode === 'range' && <span className="text-brand-muted text-xs"> (per day)</span>}
            </label>
            <NumberStepper
              value={attempts}
              onChange={setAttempts}
              min={0}
              max={200}
            />
          </div>

          {/* Leads */}
          <div>
            <label className="text-sm font-medium text-white block mb-2">
              Leads generated
              {mode === 'range' && <span className="text-brand-muted text-xs"> (per day)</span>}
            </label>
            <NumberStepper
              value={leads}
              onChange={setLeads}
              min={0}
              max={50}
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-white block mb-2">
              Note (optional)
            </label>
            <Input
              placeholder="e.g., expired listings batch"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Total */}
          {dayCount > 0 && (
            <div className="bg-brand-surface/50 border border-brand-muted/50 rounded-md p-3">
              <p className="text-sm text-brand-muted">
                Total: <span className="text-white font-semibold">{totalAttempts} outreach</span>
                {totalLeads > 0 && (
                  <> and <span className="text-white font-semibold">{totalLeads} leads</span></>
                )}
                {dayCount > 1 && (
                  <span className="text-brand-muted"> across {dayCount} days</span>
                )}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || dayCount === 0}
            className="gap-2"
          >
            {loading && <LoadingSpinner className="h-4 w-4" />}
            Log {totalAttempts}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
