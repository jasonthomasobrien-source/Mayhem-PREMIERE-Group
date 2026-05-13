'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { insertOutreach } from '@/lib/queries'
import { todayDetroit, dateToISO } from '@/lib/dates'
import { LoadingSpinner } from './LoadingSpinner'

interface QuickLogButtonsProps {
  agentId: string
  agentName: string
  agentEmoji?: string | null
}

export function QuickLogButtons({
  agentId,
  agentName,
  agentEmoji,
}: QuickLogButtonsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<number | null>(null)

  const handleQuickLog = async (attempts: number) => {
    setLoading(attempts)
    try {
      const today = dateToISO(todayDetroit())
      const result = await insertOutreach([
        {
          agent_id: agentId,
          activity_date: today,
          attempts,
          leads: 0,
          note: null,
        },
      ])

      if (result && result.length > 0) {
        toast({
          title: 'Logged successfully',
          description: `Logged ${attempts} outreach for ${agentEmoji ? agentEmoji + ' ' : ''}${agentName}`,
          variant: 'default',
        })
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
      setLoading(null)
    }
  }

  return (
    <div className="w-full space-y-3">
      <p className="text-sm font-medium text-brand-muted">Quick log for today:</p>
      <div className="grid grid-cols-3 gap-2">
        {[1, 5, 10].map((num) => (
          <Button
            key={num}
            onClick={() => handleQuickLog(num)}
            disabled={loading !== null}
            className="w-full relative"
          >
            {loading === num ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <span>+{num}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
