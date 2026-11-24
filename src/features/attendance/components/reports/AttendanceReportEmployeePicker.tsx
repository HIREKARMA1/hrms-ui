/**
 * Searchable employee roster dropdown — fills employee code on select (no auto load).
 */
import { ChevronDown, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { EmployeeRecord } from '@/features/employees/api/employeeMappers'
import { cn } from '@/lib/utils'

import { useAttendanceReportEmployeePicker } from '../../hooks/useAttendanceReportEmployeePicker'
import {
  policyControlClass,
  policyLabelClass,
  policyMutedText,
  policyPrimaryText,
  policySecondaryText,
} from './policyReport/attendancePolicyReportUi'

type AttendanceReportEmployeePickerProps = {
  selectedCode?: string
  onSelect: (record: EmployeeRecord) => void
  disabled?: boolean
}

export function AttendanceReportEmployeePicker({
  selectedCode,
  onSelect,
  disabled,
}: AttendanceReportEmployeePickerProps) {
  const [open, setOpen] = useState(false)
  const { search, setSearch, rows, isFetching } = useAttendanceReportEmployeePicker()

  const selectedLabel = rows.find((r) => r.profile.employeeId === selectedCode)
  const triggerText = selectedLabel
    ? `${selectedLabel.profile.firstName} ${selectedLabel.profile.lastName}`.trim() ||
      selectedCode
    : selectedCode
      ? selectedCode
      : 'Select employee'

  return (
    <div>
      <label className={policyLabelClass}>Employee roster</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              policyControlClass,
              'justify-between font-normal hover:bg-[#F3F4F8]',
              !selectedCode && policyMutedText,
            )}
          >
            <span className="truncate">{triggerText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-[#98A2B3]" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(100vw-2rem,320px)] rounded-xl border border-[#E2E6EF] bg-white p-2 shadow-[0_12px_32px_rgba(23,33,58,0.16)]"
          align="start"
        >
          <Input
            placeholder="Search name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              policyControlClass,
              'mb-2 border-[#8B5CF6] ring-[3px] ring-[rgba(139,92,246,0.18)]',
            )}
          />
          <div className="max-h-56 overflow-y-auto">
            {isFetching ? (
              <p className={`flex items-center gap-2 p-3 text-sm ${policySecondaryText}`}>
                <Loader2 className="h-4 w-4 animate-spin text-[#5938DB]" aria-hidden />
                Loading…
              </p>
            ) : rows.length === 0 ? (
              <p className={`p-3 text-sm ${policySecondaryText}`}>No employee found</p>
            ) : (
              <ul>
                {rows.map((record) => {
                  const name =
                    `${record.profile.firstName} ${record.profile.lastName}`.trim() || 'Employee'
                  const code = record.profile.employeeId
                  const isSelected = code === selectedCode
                  return (
                    <li key={record.server.id}>
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#F0EDFF]',
                          isSelected && 'bg-[#F0EDFF]',
                        )}
                        onClick={() => {
                          onSelect(record)
                          setOpen(false)
                        }}
                      >
                        <span className={policyPrimaryText}>{name}</span>
                        <span className={`text-[12.5px] ${policySecondaryText}`}>{code}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}