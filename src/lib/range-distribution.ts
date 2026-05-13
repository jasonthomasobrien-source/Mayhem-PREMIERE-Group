/**
 * Distribute total attempts and leads evenly across a date range.
 * Remainder is assigned to the last day(s).
 *
 * Example: 35 attempts across 7 days = [5, 5, 5, 5, 5, 5, 5]
 * Example: 36 attempts across 7 days = [5, 5, 5, 5, 5, 5, 6]
 */
export function distributeAcrossDays(
  totalAttempts: number,
  totalLeads: number,
  numDays: number
): Array<{ attempts: number; leads: number }> {
  const perDay = Math.floor(totalAttempts / numDays)
  const attemptsRemainder = totalAttempts % numDays

  const leadsPerDay = Math.floor(totalLeads / numDays)
  const leadsRemainder = totalLeads % numDays

  const result: Array<{ attempts: number; leads: number }> = []

  for (let i = 0; i < numDays; i++) {
    const isLastDay = i === numDays - 1
    const attempts = perDay + (isLastDay ? attemptsRemainder : 0)
    const leads = leadsPerDay + (isLastDay ? leadsRemainder : 0)

    result.push({ attempts, leads })
  }

  return result
}
