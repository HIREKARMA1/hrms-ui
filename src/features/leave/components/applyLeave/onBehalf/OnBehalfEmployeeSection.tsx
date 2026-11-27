import { ChevronDown, Info } from 'lucide-react'

import type { LeaveEmployee } from '../../../types/employee'
import { OnBehalfDialogField } from './OnBehalfDialogField'
import { obSectionTitleClass, obSelectClass } from './onBehalfDialogUi'

type OnBehalfEmployeeSectionProps = {
  options: LeaveEmployee[]
  value: string
  onChange: (employeeId: string) => void
  employee: LeaveEmployee
  submitterName?: string
}

export function OnBehalfEmployeeSection({
  options,
  value,
  onChange,
  employee,
  submitterName,
}: OnBehalfEmployeeSectionProps) {
  return (
    <section className="space-y-4 border-b border-[#E2E6EF] px-6 py-[22px] max-[480px]:px-4">
      <h3 className={obSectionTitleClass}>Employee</h3>
      <div className="flex items-center gap-3 rounded-xl border border-[#E2E6EF] bg-white px-3.5 py-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CCFBF1] text-sm font-semibold text-[#0F766E]"
          aria-hidden
        >
          {initials(employee.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#17213A]">{employee.name}</p>
          <p className="truncate text-xs text-[#667085]">{employee.department}</p>
        </div>
      </div>
      <OnBehalfDialogField label="Change employee" htmlFor="apply-for-employee">
        <div className="relative">
          <select
            id="apply-for-employee"
            className={obSelectClass}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.department}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
            aria-hidden
          />
        </div>
      </OnBehalfDialogField>
      {submitterName ? (
        <p className="flex items-start gap-1.5 text-[12.5px] leading-snug text-[#667085]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7055EB]" aria-hidden />
          <span>
            This request will be recorded by{' '}
            <span className="font-semibold text-[#17213A]">{submitterName}</span>.
          </span>
        </p>
      ) : null}
    </section>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}