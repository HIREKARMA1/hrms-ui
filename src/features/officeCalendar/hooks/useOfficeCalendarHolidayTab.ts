import { useMemo, useState } from 'react'

import type { OfficeHoliday } from '../types/officeCalendar'
import { filterOfficeHolidays, type OfficeHolidayFilterState } from '../utils/filterOfficeHolidays'
import { useOfficeCalendarConfirm } from './useOfficeCalendarConfirm'
import { useOfficeCalendarToast } from './useOfficeCalendarToast'

export function useOfficeCalendarHolidayTab(
  holidays: OfficeHoliday[],
  onDelete: (id: string) => Promise<void>,
) {
  const { showToast } = useOfficeCalendarToast()
  const { requestConfirm } = useOfficeCalendarConfirm()
  const [filters, setFilters] = useState<OfficeHolidayFilterState>({ query: '', type: 'all' })
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editHoliday, setEditHoliday] = useState<OfficeHoliday | null>(null)

  const filtered = useMemo(() => filterOfficeHolidays(holidays, filters), [holidays, filters])

  function openCreate() {
    setFormMode('create')
    setEditHoliday(null)
    setFormOpen(true)
  }

  function openEdit(item: OfficeHoliday) {
    setFormMode('edit')
    setEditHoliday(item)
    setFormOpen(true)
  }

  async function handleDelete(id: string) {
    const item = holidays.find((h) => h.id === id)
    if (!item) return
    const confirmed = await requestConfirm({
      title: 'Delete holiday?',
      description: `Remove “${item.name}” from the office calendar.`,
    })
    if (!confirmed) return
    await onDelete(id)
    showToast('Holiday removed.')
  }

  return {
    filters,
    setFilters,
    filtered,
    formOpen,
    setFormOpen,
    formMode,
    editHoliday,
    openCreate,
    openEdit,
    handleDelete,
  }
}