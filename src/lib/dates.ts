import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  parseISO,
  format,
  differenceInDays,
  isBefore,
  isAfter,
  eachDayOfInterval,
  getWeek,
} from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'America/Detroit'
const SPRINT_START = new Date('2026-05-12')
const SPRINT_END = new Date('2026-06-30')

// Get current date in Detroit timezone
export function todayDetroit(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

// Format date for display
export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy')
}

// Format date as ISO string (YYYY-MM-DD)
export function dateToISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// Parse ISO string to Date
export function parseDate(iso: string): Date {
  return parseISO(iso)
}

// Get week number (1-indexed) within sprint
export function getSprintWeekNumber(date: Date): number {
  const daysFromStart = differenceInDays(date, SPRINT_START)
  return Math.floor(daysFromStart / 7) + 1
}

// Get Monday and Sunday of the given week (sprint week number)
export function getWeekBounds(weekNumber: number): { start: Date; end: Date } {
  const weekStart = new Date(SPRINT_START)
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  return { start: weekStart, end: weekEnd }
}

// Get current sprint week (1-8, or partial 8)
export function getCurrentSprintWeek(): number {
  return getSprintWeekNumber(todayDetroit())
}

// Days elapsed since sprint start
export function getDaysElapsed(): number {
  return differenceInDays(todayDetroit(), SPRINT_START)
}

// Days remaining until sprint end
export function getDaysRemaining(): number {
  return differenceInDays(SPRINT_END, todayDetroit())
}

// Team goal to date (5 attempts × 12 agents × daysElapsed)
export function getTeamGoalToDate(): number {
  return getDaysElapsed() * 5 * 12
}

// Total team goal for sprint (50 days × 5 × 12)
export function getTeamGoalTotal(): number {
  return 50 * 5 * 12 // 3000
}

// Conversion rate, guard against /0
export function conversionRate(attempts: number, leads: number): number {
  if (attempts === 0) return 0
  return leads / attempts
}

// Format conversion rate as percentage
export function formatConversion(attempts: number, leads: number): string {
  const rate = conversionRate(attempts, leads)
  return (rate * 100).toFixed(1)
}

// Projected finish date based on current pace
export function getProjectedFinish(
  currentAttempts: number,
  currentDaysElapsed: number
): Date {
  if (currentDaysElapsed === 0) return SPRINT_END
  const dailyPace = currentAttempts / currentDaysElapsed
  const remainingNeeded = 3000 - currentAttempts
  const daysNeeded = Math.ceil(remainingNeeded / dailyPace)
  const projected = new Date(todayDetroit())
  projected.setDate(projected.getDate() + daysNeeded)
  return projected
}

// Check if date is within sprint window
export function isWithinSprintWindow(date: Date): boolean {
  const iso = dateToISO(date)
  const start = dateToISO(SPRINT_START)
  const end = dateToISO(SPRINT_END)
  return iso >= start && iso <= end
}

// Check if date is today or in the past (no future logging)
export function isNotInFuture(date: Date): boolean {
  return isBefore(date, todayDetroit()) || dateToISO(date) === dateToISO(todayDetroit())
}
