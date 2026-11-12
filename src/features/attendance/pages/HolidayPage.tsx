import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

import { departments, holidayRecords } from '../mocks/attendanceMocks'
import type { HolidayRecord } from '../types/attendance'

type HolidayFormState = {
  name: string
  date: string
  type: HolidayRecord['type']
  department: string
  mandatory: boolean
}

const holidayTypes: HolidayRecord['type'][] = [
  'National',
  'Festival',
  'Optional',
  'Company',
]

const emptyForm: HolidayFormState = {
  name: '',
  date: '',
  type: 'National',
  department: 'All',
  mandatory: true,
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function HolidayPage() {
  const [holidays, setHolidays] = useState<HolidayRecord[]>(() => [
    ...holidayRecords,
  ])
  const [year, setYear] = useState('2026')
  const [calendarMonth, setCalendarMonth] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<HolidayFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<HolidayRecord | null>(null)

  const yearOptions = useMemo(() => {
    const values = new Set(holidays.map((holiday) => holiday.date.slice(0, 4)))
    values.add(year)
    return Array.from(values).sort()
  }, [holidays, year])

  const filteredHolidays = useMemo(
    () => holidays.filter((holiday) => holiday.date.startsWith(year)),
    [holidays, year],
  )

  const calendarYear = Number(year)
  const monthHolidays = useMemo(() => {
    const prefix = monthKey(calendarYear, calendarMonth)
    return filteredHolidays.filter((holiday) => holiday.date.startsWith(prefix))
  }, [filteredHolidays, calendarYear, calendarMonth])

  const holidaysByDay = useMemo(() => {
    const map = new Map<number, HolidayRecord[]>()
    for (const holiday of monthHolidays) {
      const day = Number(holiday.date.slice(8, 10))
      const existing = map.get(day) ?? []
      map.set(day, [...existing, holiday])
    }
    return map
  }, [monthHolidays])

  const calendarCells = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay()
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate()
    const cells: Array<{ day: number | null; holidays: HolidayRecord[] }> = []

    for (let index = 0; index < firstDay; index += 1) {
      cells.push({ day: null, holidays: [] })
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, holidays: holidaysByDay.get(day) ?? [] })
    }
    return cells
  }, [calendarYear, calendarMonth, holidaysByDay])

  const monthLabel = new Date(calendarYear, calendarMonth, 1).toLocaleDateString(
    'en-GB',
    { month: 'long', year: 'numeric' },
  )

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (holiday: HolidayRecord) => {
    setEditingId(holiday.id)
    setForm({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      department: holiday.department,
      mandatory: holiday.mandatory,
    })
    setFormOpen(true)
  }

  const saveHoliday = () => {
    if (!form.name.trim() || !form.date) return

    if (editingId) {
      setHolidays((prev) =>
        prev.map((holiday) =>
          holiday.id === editingId
            ? {
                ...holiday,
                name: form.name.trim(),
                date: form.date,
                type: form.type,
                department: form.department,
                mandatory: form.mandatory,
              }
            : holiday,
        ),
      )
    } else {
      setHolidays((prev) => [
        ...prev,
        {
          id: `h-${Date.now()}`,
          name: form.name.trim(),
          date: form.date,
          type: form.type,
          department: form.department,
          mandatory: form.mandatory,
        },
      ])
    }

    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setHolidays((prev) => prev.filter((holiday) => holiday.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const goToPreviousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setYear(String(calendarYear - 1))
      return
    }
    setCalendarMonth((prev) => prev - 1)
  }

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setYear(String(calendarYear + 1))
      return
    }
    setCalendarMonth((prev) => prev + 1)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Holidays</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage company holidays on the calendar and list views.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={year}
            onValueChange={(value) => {
              setYear(value)
              setCalendarMonth(0)
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Holiday
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-navy">{monthLabel}</h2>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={goToPreviousMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-text-secondary">
              {weekdayLabels.map((label) => (
                <div key={label} className="py-2">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, index) => {
                const isHoliday = cell.holidays.length > 0
                return (
                  <div
                    key={`${cell.day ?? 'blank'}-${index}`}
                    className={`min-h-[88px] rounded-xl border px-2 py-2 text-left ${
                      cell.day === null
                        ? 'border-transparent bg-transparent'
                        : isHoliday
                          ? 'border-brand-200 bg-brand-50'
                          : 'border-border-soft bg-muted-bg/40'
                    }`}
                  >
                    {cell.day !== null ? (
                      <>
                        <p
                          className={`text-sm font-semibold ${
                            isHoliday ? 'text-brand-600' : 'text-navy'
                          }`}
                        >
                          {cell.day}
                        </p>
                        <div className="mt-1 space-y-1">
                          {cell.holidays.map((holiday) => (
                            <p
                              key={holiday.id}
                              className="truncate text-[11px] font-medium text-navy"
                              title={holiday.name}
                            >
                              {holiday.name}
                            </p>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="overflow-x-auto rounded-2xl border border-border-soft bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted-bg/70 text-text-secondary">
                <tr>
                  <th className="px-3 py-3 font-medium">Holiday Name</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Department</th>
                  <th className="px-3 py-3 font-medium">Mandatory</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHolidays.map((holiday) => (
                  <tr key={holiday.id} className="border-t border-border-soft">
                    <td className="px-3 py-3 font-medium text-navy">{holiday.name}</td>
                    <td className="px-3 py-3 text-text-secondary">{holiday.date}</td>
                    <td className="px-3 py-3 text-text-secondary">{holiday.type}</td>
                    <td className="px-3 py-3 text-text-secondary">
                      {holiday.department}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={holiday.mandatory ? 'success' : 'secondary'}>
                        {holiday.mandatory ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-text-secondary"
                          onClick={() => openEdit(holiday)}
                          aria-label={`Edit ${holiday.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#EF4444] hover:bg-rose-50"
                          onClick={() => setDeleteTarget(holiday)}
                          aria-label={`Delete ${holiday.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHolidays.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-text-secondary"
                    >
                      No holidays found for {year}.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update holiday details for the selected year.'
                : 'Create a holiday entry for the organization calendar.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="holiday-name">Holiday Name</Label>
              <Input
                id="holiday-name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="e.g. Republic Day"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holiday-date">Date</Label>
              <Input
                id="holiday-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, date: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(type) =>
                  setForm((prev) => ({
                    ...prev,
                    type: type as HolidayRecord['type'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {holidayTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(department) =>
                  setForm((prev) => ({ ...prev, department }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="holiday-mandatory"
                checked={form.mandatory}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, mandatory: checked === true }))
                }
              />
              <Label htmlFor="holiday-mandatory">Mandatory holiday</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveHoliday}>
              {editingId ? 'Save Changes' : 'Add Holiday'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete holiday?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will remove "${deleteTarget.name}" on ${deleteTarget.date} from the UI preview list.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#EF4444] hover:bg-[#DC2626]"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HolidayPage
