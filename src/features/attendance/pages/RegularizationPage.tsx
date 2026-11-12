import { useState } from 'react'

import {
  RegularizationForm,
  type RegularizationFormValues,
} from '../components/RegularizationForm'
import { ApprovalStatusBadge } from '../components/AttendanceStatusBadge'
import { regularizationRequests } from '../mocks/attendanceMocks'
import type { RegularizationRequest } from '../types/attendance'
import { ToastBanner, useToast } from '@/hooks/useToast'

function formatDisplayDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTimeDisplay(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function RegularizationPage() {
  const { message, toast } = useToast()
  const [history, setHistory] = useState<RegularizationRequest[]>(() => [
    ...regularizationRequests,
  ])

  const handleSubmit = (values: RegularizationFormValues) => {
    const today = new Date()
    const requestDate = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    const next: RegularizationRequest = {
      id: `r-${Date.now()}`,
      employeeName: 'Rohith Goud',
      employeeId: 'EMP-1001',
      requestDate,
      attendanceDate: formatDisplayDate(values.attendanceDate),
      correctionType: values.correctionType,
      checkIn: formatTimeDisplay(values.checkIn),
      checkOut: formatTimeDisplay(values.checkOut),
      reason: values.reason.trim(),
      status: 'Pending',
      approver: '—',
    }

    setHistory((prev) => [next, ...prev])
    toast('Regularization request submitted (UI preview only).')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Attendance Regularization
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Submit a regularization request and track approval history.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
        <RegularizationForm onSubmit={handleSubmit} />

        <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-sm">
          <div className="border-b border-border-soft px-5 py-4">
            <h2 className="text-base font-semibold text-navy">Request History</h2>
            <p className="text-sm text-text-secondary">
              Past and pending regularization requests.
            </p>
          </div>
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted-bg/70 text-text-secondary">
              <tr>
                <th className="px-3 py-3 font-medium">Employee</th>
                <th className="px-3 py-3 font-medium">Employee ID</th>
                <th className="px-3 py-3 font-medium">Request Date</th>
                <th className="px-3 py-3 font-medium">Attendance Date</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Check-in</th>
                <th className="px-3 py-3 font-medium">Check-out</th>
                <th className="px-3 py-3 font-medium">Reason</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Approver</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-t border-border-soft">
                  <td className="px-3 py-3 font-medium text-navy">
                    {row.employeeName}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{row.employeeId}</td>
                  <td className="px-3 py-3 text-text-secondary">{row.requestDate}</td>
                  <td className="px-3 py-3 text-text-secondary">{row.attendanceDate}</td>
                  <td className="px-3 py-3 text-text-secondary">{row.correctionType}</td>
                  <td className="px-3 py-3 text-text-secondary">{row.checkIn}</td>
                  <td className="px-3 py-3 text-text-secondary">{row.checkOut}</td>
                  <td className="max-w-[180px] truncate px-3 py-3 text-text-secondary">
                    {row.reason}
                  </td>
                  <td className="px-3 py-3">
                    <ApprovalStatusBadge status={row.status} />
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{row.approver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ToastBanner message={message} />
    </div>
  )
}

export default RegularizationPage
