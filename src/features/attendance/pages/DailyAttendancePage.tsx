import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TablePagination } from '@/components/ui/table-pagination'
import { ToastBanner, useToast } from '@/hooks/useToast'

import {
  AttendanceFilters,
  AttendanceTable,
  type AttendanceFilterState,
} from '../components'
import { HrAttendanceLiveReport } from '../components/HrAttendanceLiveReport'
import { dailyAttendanceRecords } from '../mocks/attendanceMocks'
import type { DailyAttendanceRecord } from '../types/attendance'

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

function displayDateFromIso(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return ''
  return `${day} ${MONTH_LABELS[month - 1]} ${year}`
}

const initialFilters: AttendanceFilterState = {
  search: '',
  department: 'All',
  date: '',
  status: 'All',
  shift: 'All',
}

export function DailyAttendancePage() {
  const { message, toast } = useToast()
  const [filters, setFilters] = useState<AttendanceFilterState>(initialFilters)
  const [records, setRecords] = useState<DailyAttendanceRecord[]>(() => [
    ...dailyAttendanceRecords,
  ])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 5

  const [viewRecord, setViewRecord] = useState<DailyAttendanceRecord | null>(null)
  const [editRecord, setEditRecord] = useState<DailyAttendanceRecord | null>(null)
  const [editDraft, setEditDraft] = useState({
    checkIn: '',
    checkOut: '',
    status: '' as DailyAttendanceRecord['status'],
  })

  const filteredRecords = useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    const displayDate =
      filters.date.trim() !== ''
        ? displayDateFromIso(filters.date)
        : ''

    return records.filter((record) => {
      if (query) {
        const matchesSearch =
          record.employeeName.toLowerCase().includes(query) ||
          record.employeeId.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      if (filters.department !== 'All' && record.department !== filters.department) {
        return false
      }
      if (filters.status !== 'All' && record.status !== filters.status) {
        return false
      }
      if (filters.shift !== 'All' && record.shift !== filters.shift) {
        return false
      }
      if (displayDate && !record.date.includes(displayDate)) {
        return false
      }
      return true
    })
  }, [filters, records])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const [filtersKey, setFiltersKey] = useState(filters)
  if (filters !== filtersKey) {
    setFiltersKey(filters)
    if (page !== 1) setPage(1)
  }

  const safePage = Math.min(page, totalPages)
  if (page !== safePage) {
    setPage(safePage)
  }

  const pageRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, safePage])

  const visibleIds = pageRecords.map((record) => record.id)

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      if (!checked) {
        return prev.filter((id) => !visibleIds.includes(id))
      }
      const merged = new Set([...prev, ...visibleIds])
      return [...merged]
    })
  }

  const handleToggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id),
    )
  }

  const openView = (record: DailyAttendanceRecord) => {
    setViewRecord(record)
  }

  const openEdit = (record: DailyAttendanceRecord) => {
    setEditRecord(record)
    setEditDraft({
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
    })
  }

  const saveEdit = () => {
    if (!editRecord) return
    setRecords((prev) =>
      prev.map((item) =>
        item.id === editRecord.id
          ? {
              ...item,
              checkIn: editDraft.checkIn,
              checkOut: editDraft.checkOut,
              status: editDraft.status,
            }
          : item,
      ),
    )
    setEditRecord(null)
    toast('Attendance record updated (UI preview only).')
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-7 pb-8 font-[Inter,system-ui,sans-serif]">
      <ToastBanner message={message} />

      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.4px] text-[#17213A]">Daily Attendance</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Employee roster, code or ID lookup, and date range from the live API — check-in, check-out, and
          status by day.
        </p>
      </header>

      <HrAttendanceLiveReport title="Daily employee attendance (live API)" />

      <h2 className="text-lg font-semibold text-navy">Daily register (mock data)</h2>

      <AttendanceFilters
        value={filters}
        onChange={setFilters}
        onExport={() => toast('CSV export is a UI preview only.')}
      />

      <AttendanceTable
        records={pageRecords}
        selectedIds={selectedIds}
        onToggleAll={handleToggleAll}
        onToggleOne={handleToggleOne}
        onView={openView}
        onEdit={openEdit}
      />

      <TablePagination
        page={safePage}
        totalPages={totalPages}
        total={filteredRecords.length}
        itemLabel="records"
        summary={`Showing ${(safePage - 1) * pageSize + (pageRecords.length ? 1 : 0)}–${
          (safePage - 1) * pageSize + pageRecords.length
        } of ${filteredRecords.length} records`}
        onPageChange={setPage}
      />

      <Dialog
        open={viewRecord !== null}
        onOpenChange={(open) => {
          if (!open) setViewRecord(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>
              {viewRecord
                ? `${viewRecord.employeeName} · ${viewRecord.date}`
                : 'Record details'}
            </DialogDescription>
          </DialogHeader>
          {viewRecord ? (
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Employee ID</dt>
                <dd className="font-medium text-navy">{viewRecord.employeeId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Department</dt>
                <dd className="text-navy">{viewRecord.department}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Designation</dt>
                <dd className="text-navy">{viewRecord.designation}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Check-in</dt>
                <dd className="text-navy">{viewRecord.checkIn}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Check-out</dt>
                <dd className="text-navy">{viewRecord.checkOut}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Break</dt>
                <dd className="text-navy">{viewRecord.breakDuration}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Working hours</dt>
                <dd className="text-navy">{viewRecord.workingHours}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Overtime</dt>
                <dd className="text-navy">{viewRecord.overtime}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Shift</dt>
                <dd className="text-navy">{viewRecord.shift}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Status</dt>
                <dd className="text-navy">{viewRecord.status}</dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editRecord !== null}
        onOpenChange={(open) => {
          if (!open) setEditRecord(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>
              {editRecord
                ? `Update times for ${editRecord.employeeName}`
                : 'Edit record'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-check-in">Check-in</Label>
              <Input
                id="edit-check-in"
                value={editDraft.checkIn}
                onChange={(event) =>
                  setEditDraft((prev) => ({ ...prev, checkIn: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-check-out">Check-out</Label>
              <Input
                id="edit-check-out"
                value={editDraft.checkOut}
                onChange={(event) =>
                  setEditDraft((prev) => ({ ...prev, checkOut: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Input
                id="edit-status"
                value={editDraft.status}
                onChange={(event) =>
                  setEditDraft((prev) => ({
                    ...prev,
                    status: event.target.value as DailyAttendanceRecord['status'],
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditRecord(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveEdit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastBanner message={message} />
    </div>
  )
}

export default DailyAttendancePage