import type { Dispatch, SetStateAction } from 'react'

import type { OfficeHolidayInput, OfficeHolidayType } from '../../types/officeCalendar'
import { OFFICE_HOLIDAY_TYPES } from '../../utils/officeHolidayForm'

const fieldClass = 'mt-1 h-10 w-full rounded-xl border border-hrms-border px-3 text-hrms-navy'

type OfficeHolidayFormFieldsProps = {
  draft: OfficeHolidayInput
  setDraft: Dispatch<SetStateAction<OfficeHolidayInput>>
}

export function OfficeHolidayFormFields({ draft, setDraft }: OfficeHolidayFormFieldsProps) {
  return (
    <>
      <label className="text-sm text-hrms-text-secondary sm:col-span-2">
        Name
        <input
          className={fieldClass}
          value={draft.name}
          onChange={(event) => setDraft((state) => ({ ...state, name: event.target.value }))}
          required
        />
      </label>
      <label className="text-sm text-hrms-text-secondary">
        Date
        <input
          type="date"
          className={fieldClass}
          value={draft.date}
          onChange={(event) => setDraft((state) => ({ ...state, date: event.target.value }))}
          required
        />
      </label>
      <label className="text-sm text-hrms-text-secondary">
        Type
        <select
          className={fieldClass}
          value={draft.type}
          onChange={(event) =>
            setDraft((state) => ({ ...state, type: event.target.value as OfficeHolidayType }))
          }
        >
          {OFFICE_HOLIDAY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-hrms-text-secondary sm:col-span-2">
        Description
        <textarea
          className="mt-1 min-h-[4rem] w-full rounded-xl border border-hrms-border px-3 py-2 text-hrms-navy"
          value={draft.description}
          onChange={(event) => setDraft((state) => ({ ...state, description: event.target.value }))}
        />
      </label>
    </>
  )
}