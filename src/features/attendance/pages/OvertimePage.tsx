import { useMemo, useState } from 'react'
import { Search, Timer, Clock, CheckCircle2, Hourglass } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToastBanner, useToast } from '@/hooks/useToast'

import { ApprovalStatusBadge } from '../components/AttendanceStatusBadge'
import { departments, overtimeRecords } from '../mocks/attendanceMocks'
import type { ApprovalStatus, OvertimeRecord } from '../types/attendance'

const approvalStatuses = ['All', 'Pending', 'Approved', 'Rejected'] as const

function parseOvertimeMinutes(value: string): number {
  const hoursMatch = value.match(/(\d+)h/)
  const minutesMatch = value.match(/(\d+)m/)
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0
  return hours * 60 + minutes
}

function formatOvertimeTotal(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

export function OvertimePage() {
  const { message, toast } = useToast()
  const [records, setRecords] = useState<OvertimeRecord[]>(() => [
    ...overtimeRecords,
  ])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState<string>('All')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.employeeName.toLowerCase().includes(query) ||
        record.employeeId.toLowerCase().includes(query)
      const matchesDepartment =
        department === 'All' || record.department === department
      const matchesStatus = status === 'All' || record.status === status
      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [records, search, department, status])

  const summary = useMemo(() => {
    const uniqueEmployees = new Set(records.map((record) => record.employeeId))
    const totalMinutes = records.reduce(
      (sum, record) => sum + parseOvertimeMinutes(record.overtimeHours),
      0,
    )
    const pendingCount = records.filter((record) => record.status === 'Pending').length
    const approvedMinutes = records
      .filter((record) => record.status === 'Approved')
      .reduce((sum, record) => sum + parseOvertimeMinutes(record.overtimeHours), 0)

    return {
      employeeCount: uniqueEmployees.size,
      totalHours: formatOvertimeTotal(totalMinutes),
      pendingCount,
      approvedHours: formatOvertimeTotal(approvedMinutes),
    }
  }, [records])

  const updateStatus = (id: string, nextStatus: ApprovalStatus) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, status: nextStatus } : record,
      ),
    )
    toast(
      nextStatus === 'Approved'
        ? 'Overtime approved (UI preview only).'
        : 'Overtime rejected (UI preview only).',
    )
  }

  const summaryCards = [
    {
      label: 'Total OT Employees',
      value: summary.employeeCount,
      icon: Timer,
      iconClassName: 'bg-lavender text-brand-500',
    },
    {
      label: 'Total OT Hours',
      value: summary.totalHours,
      icon: Clock,
      iconClassName: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Pending Approvals',
      value: summary.pendingCount,
      icon: Hourglass,
      iconClassName: 'bg-amber-50 text-[#F59E0B]',
    },
    {
      label: 'Approved OT Hours',
      value: summary.approvedHours,
      icon: CheckCircle2,
      iconClassName: 'bg-emerald-50 text-[#16A34A]',
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Overtime</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Monitor overtime hours and approve pending requests.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-border-soft shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">{card.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-navy">
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:flex-wrap">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee name or ID"
            className="h-10 pl-9"
          />
        </div>

        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full lg:w-[170px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((item) => (
              <SelectItem key={item} value={item}>
                {item === 'All' ? 'All Departments' : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {approvalStatuses.map((item) => (
              <SelectItem key={item} value={item}>
                {item === 'All' ? 'All Statuses' : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted-bg/70 text-text-secondary">
            <tr>
              <th className="px-3 py-3 font-medium">Employee</th>
              <th className="px-3 py-3 font-medium">Employee ID</th>
              <th className="px-3 py-3 font-medium">Department</th>
              <th className="px-3 py-3 font-medium">Date</th>
              <th className="px-3 py-3 font-medium">Regular Hours</th>
              <th className="px-3 py-3 font-medium">Overtime Hours</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id} className="border-t border-border-soft">
                <td className="px-3 py-3 font-medium text-navy">
                  {record.employeeName}
                </td>
                <td className="px-3 py-3 text-text-secondary">{record.employeeId}</td>
                <td className="px-3 py-3 text-text-secondary">{record.department}</td>
                <td className="px-3 py-3 text-text-secondary">{record.date}</td>
                <td className="px-3 py-3 text-text-secondary">{record.regularHours}</td>
                <td className="px-3 py-3 text-text-secondary">
                  {record.overtimeHours}
                </td>
                <td className="px-3 py-3">
                  <ApprovalStatusBadge status={record.status} />
                </td>
                <td className="px-3 py-3">
                  {record.status === 'Pending' ? (
                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 border-rose-200 text-[#EF4444] hover:bg-rose-50"
                        onClick={() => updateStatus(record.id, 'Rejected')}
                      >
                        Reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8"
                        onClick={() => updateStatus(record.id, 'Approved')}
                      >
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <span className="text-text-secondary">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-text-secondary"
                >
                  No overtime records match the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <ToastBanner message={message} />
    </div>
  )
}

export default OvertimePage
