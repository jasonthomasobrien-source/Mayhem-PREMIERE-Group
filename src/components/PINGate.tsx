'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface PINGateProps {
  onSuccess: () => void
}

export function PINGate({ onSuccess }: PINGateProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || 'goalby11'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple client-side validation (PIN is environment variable)
    if (pin === correctPin) {
      onSuccess()
    } else {
      setError('Incorrect PIN')
      setPin('')
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-black">
      <div className="w-full max-w-sm px-6 py-12">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-sm text-brand-muted">
              Enter the PIN to access admin tools
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              {error && (
                <p className="text-xs text-brand-danger mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || pin.length === 0}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Enter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
