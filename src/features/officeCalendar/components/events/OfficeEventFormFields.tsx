import type { Dispatch, SetStateAction } from 'react'

import type { OfficeCalendarEventInput } from '../../types/officeCalendar'
import { OfficeEventFormMetaFields } from './OfficeEventFormMetaFields'
import { OfficeEventFormPrimaryFields } from './OfficeEventFormPrimaryFields'

type OfficeEventFormFieldsProps = {
  draft: OfficeCalendarEventInput
  setDraft: Dispatch<SetStateAction<OfficeCalendarEventInput>>
  error: string | null
}

export function OfficeEventFormFields({ draft, setDraft, error }: OfficeEventFormFieldsProps) {
  return (
    <>
      <OfficeEventFormPrimaryFields draft={draft} setDraft={setDraft} />
      <OfficeEventFormMetaFields draft={draft} setDraft={setDraft} />
      {error ? (
        <p className="sm:col-span-2 text-sm text-hrms-danger" role="alert">
          {error}
        </p>
      ) : null}
    </>
  )
}