import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BiometricAttendanceDaysTable } from '@/features/biometric/components/BiometricAttendanceDaysTable'
import { BiometricAttendancePunchesTable } from '@/features/biometric/components/BiometricAttendancePunchesTable'
import {
  BIOMETRIC_ATTENDANCE_SOURCE_OPTIONS,
  sortBiometricPunches,
} from '@/features/biometric/components/biometricAttendanceUi'
import type { BiometricAttendanceSource } from '@/features/biometric/constants/biometricApiAccess'
import { useBiometricAttendanceByEmployeeId } from '@/features/biometric/hooks'
import {
  defaultBiometricAttendanceRange,
  validateBiometricDateRange,
} from '@/features/biometric/utils/biometricAttendanceDates'
import { getApiErrorMessage } from '@/services/api/errors'

type EmployeeBiometricAttendanceCardProps = {
  employeeId: string
}

export function EmployeeBiometricAttendanceCard({
  employeeId,
}: EmployeeBiometricAttendanceCardProps) {
  const [range, setRange] = useState(defaultBiometricAttendanceRange)
  const [source, setSource] = useState<BiometricAttendanceSource>('auto')
  const rangeError = validateBiometricDateRange(range.fromDate, range.toDate)

  const query = useMemo(
    () => ({
      employeeId,
      fromDate: range.fromDate,
      toDate: range.toDate,
      source,
    }),
    [employeeId, range.fromDate, range.toDate, source],
  )

  const attendance = useBiometricAttendanceByEmployeeId(query, {
    skip: Boolean(rangeError),
  })

  const punches = useMemo(
    () => sortBiometricPunches(attendance.data?.punches ?? []),
    [attendance.data?.punches],
  )

  const deviceLabel = useMemo(() => {
    const device = attendance.data?.device
    if (!device) return null
    if (device.deviceName && device.deviceCode) {
      return `${device.deviceName} (${device.deviceCode})`
    }
    return device.deviceName || device.deviceCode || null
  }, [attendance.data?.device])

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-navy">TimeWatch punches</CardTitle>
        <CardDescription>
          Read-only punch history for this employee (date range up to 31 days).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="bio-att-from">From</Label>
            <Input
              id="bio-att-from"
              type="date"
              value={range.fromDate}
              onChange={(event) =>
                setRange((state) => ({ ...state, fromDate: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio-att-to">To</Label>
            <Input
              id="bio-att-to"
              type="date"
              value={range.toDate}
              onChange={(event) =>
                setRange((state) => ({ ...state, toDate: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Source</Label>
            <Select
              value={source}
              onValueChange={(value) => setSource(value as BiometricAttendanceSource)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BIOMETRIC_ATTENDANCE_SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={attendance.isFetching}
            onClick={() => void attendance.refetch()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${attendance.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {rangeError ? <p className="text-sm text-amber-700">{rangeError}</p> : null}

        {attendance.isFetching && !attendance.data ? (
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading punches…
          </p>
        ) : null}

        {attendance.isError ? (
          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-text-secondary">
              {getApiErrorMessage(attendance.error, 'Could not load biometric attendance.')}
            </p>
          </div>
        ) : null}

        {!attendance.isError && !rangeError && attendance.data ? (
          <>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">{punches.length} punch(es)</Badge>
              <Badge variant="secondary">Source: {attendance.data.source}</Badge>
              {attendance.data.timezone ? (
                <Badge variant="outline">{attendance.data.timezone}</Badge>
              ) : null}
              {deviceLabel ? <Badge variant="outline">{deviceLabel}</Badge> : null}
              {attendance.data.truncated ? (
                <Badge variant="warning">Results truncated</Badge>
              ) : null}
            </div>

            <BiometricAttendanceDaysTable days={attendance.data.days ?? []} />

            <div className="space-y-2">
              <p className="text-sm font-medium text-navy">Punch log</p>
              <BiometricAttendancePunchesTable
                punches={punches}
                deviceLabel={attendance.data.device?.deviceCode}
              />
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
