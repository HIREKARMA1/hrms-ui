import { useEffect, useMemo, useState } from 'react'
import { Clock3, Coffee, LogIn, LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { getUserDisplayName, getUserInitials } from '@/features/auth/utils/authUser'
import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'
import { ToastBanner, useToast } from '@/hooks/useToast'

import { AttendanceTimeline, type TimelineEvent } from '../components'

type AttendancePhase =
  | 'not-checked-in'
  | 'checked-in'
  | 'on-break'
  | 'checked-out'

const SCHEDULED_SECONDS = 8 * 60 * 60

function formatClock(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

function formatHoursMinutes(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function SessionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-muted-bg/50 px-4 py-3">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-semibold text-navy">{value}</p>
    </div>
  )
}

export function CheckInPage() {
  const { user } = useAuthenticatedUser()
  const rbac = useOptionalRbacSession()
  const { message, toast } = useToast()
  const [now, setNow] = useState(() => new Date())
  const [phase, setPhase] = useState<AttendancePhase>('not-checked-in')
  const [checkInAt, setCheckInAt] = useState<Date | null>(null)
  const [checkOutAt, setCheckOutAt] = useState<Date | null>(null)
  const [breakStartedAt, setBreakStartedAt] = useState<Date | null>(null)
  const [accumulatedBreakSeconds, setAccumulatedBreakSeconds] = useState(0)
  const [tick, setTick] = useState(0)
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (phase !== 'checked-in' && phase !== 'on-break') return
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [phase])

  const currentBreakSeconds = useMemo(() => {
    if (phase !== 'on-break' || !breakStartedAt) return 0
    return Math.max(0, Math.floor((Date.now() - breakStartedAt.getTime()) / 1000))
  }, [phase, breakStartedAt, tick, now])

  const totalBreakSeconds = accumulatedBreakSeconds + currentBreakSeconds

  const workingSeconds = useMemo(() => {
    if (!checkInAt) return 0
    const endMs =
      phase === 'checked-out' && checkOutAt
        ? checkOutAt.getTime()
        : Date.now()
    const gross = Math.max(0, Math.floor((endMs - checkInAt.getTime()) / 1000))
    return Math.max(0, gross - totalBreakSeconds)
  }, [checkInAt, checkOutAt, phase, totalBreakSeconds, tick, now])

  const productiveSeconds = workingSeconds
  const overtimeSeconds = Math.max(0, workingSeconds - SCHEDULED_SECONDS)

  const summaryCards = [
    { label: 'Scheduled', value: '8h 0m' },
    { label: 'Actual', value: formatHoursMinutes(workingSeconds) },
    { label: 'Break', value: formatHoursMinutes(totalBreakSeconds) },
    { label: 'Productive', value: formatHoursMinutes(productiveSeconds) },
    { label: 'Overtime', value: formatHoursMinutes(overtimeSeconds) },
    { label: 'Late', value: phase === 'not-checked-in' ? '—' : '0m' },
    { label: 'Early Departure', value: phase === 'checked-out' ? '0m' : '—' },
  ]

  const pushEvent = (event: Omit<TimelineEvent, 'id'>) => {
    setEvents((prev) => [
      ...prev,
      { ...event, id: `${event.type}-${prev.length + 1}` },
    ])
  }

  const handleCheckIn = () => {
    const time = new Date()
    setCheckInAt(time)
    setPhase('checked-in')
    pushEvent({
      label: 'Checked in',
      time: formatClock(time),
      type: 'check-in',
    })
    toast('Checked in successfully.')
  }

  const handleStartBreak = () => {
    const time = new Date()
    setBreakStartedAt(time)
    setPhase('on-break')
    pushEvent({
      label: 'Break started',
      time: formatClock(time),
      type: 'break-start',
    })
    toast('Break started.')
  }

  const handleEndBreak = () => {
    const time = new Date()
    if (breakStartedAt) {
      const duration = Math.max(
        0,
        Math.floor((time.getTime() - breakStartedAt.getTime()) / 1000),
      )
      setAccumulatedBreakSeconds((prev) => prev + duration)
    }
    setBreakStartedAt(null)
    setPhase('checked-in')
    pushEvent({
      label: 'Break ended',
      time: formatClock(time),
      type: 'break-end',
    })
    toast('Break ended.')
  }

  const handleCheckOut = () => {
    const time = new Date()
    setCheckOutAt(time)
    setPhase('checked-out')
    pushEvent({
      label: 'Checked out',
      time: formatClock(time),
      type: 'check-out',
    })
    toast('Checked out for the day.')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Check In</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Mark attendance, manage breaks, and track your working hours for today.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border-soft shadow-sm xl:col-span-1">
          <CardContent className="flex items-center gap-4 p-6">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-lavender text-lg font-semibold text-brand-500">
                {user ? getUserInitials(user) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-navy">
                {user ? getUserDisplayName(user) : 'User'}
              </p>
              <p className="text-sm text-text-secondary">{rbac?.roleLabel ?? user?.role ?? ''}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm xl:col-span-2">
          <CardContent className="flex flex-col justify-center gap-1 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock3 className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-medium">{formatLongDate(now)}</span>
            </div>
            <p className="text-3xl font-bold tabular-nums tracking-tight text-navy">
              {formatClock(now)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Today&apos;s Actions</CardTitle>
          <CardDescription>
            Use the controls below to record your attendance for the day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="gap-2"
              disabled={phase !== 'not-checked-in'}
              onClick={handleCheckIn}
            >
              <LogIn className="h-4 w-4" />
              Check In
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={phase !== 'checked-in'}
              onClick={handleStartBreak}
            >
              <Coffee className="h-4 w-4" />
              Start Break
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={phase !== 'on-break'}
              onClick={handleEndBreak}
            >
              <Coffee className="h-4 w-4" />
              End Break
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={phase !== 'checked-in'}
              onClick={handleCheckOut}
            >
              <LogOut className="h-4 w-4" />
              Check Out
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SessionStat
              label="Check-in"
              value={checkInAt ? formatClock(checkInAt) : '—'}
            />
            <SessionStat
              label="Check-out"
              value={checkOutAt ? formatClock(checkOutAt) : '—'}
            />
            <SessionStat
              label="Break duration"
              value={totalBreakSeconds > 0 ? formatDuration(totalBreakSeconds) : '—'}
            />
            <SessionStat
              label="Working hours"
              value={checkInAt ? formatDuration(workingSeconds) : '—'}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-border-soft shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-text-secondary">{card.label}</p>
              <p className="mt-2 text-lg font-bold text-navy">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Timeline</CardTitle>
          <CardDescription>Events recorded during your session today</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <AttendanceTimeline events={events} />
          ) : (
            <p className="text-sm text-text-secondary">
              No events yet. Check in to start your timeline.
            </p>
          )}
        </CardContent>
      </Card>

      <ToastBanner message={message} />
    </div>
  )
}

export default CheckInPage
