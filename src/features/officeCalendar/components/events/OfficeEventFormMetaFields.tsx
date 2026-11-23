import type { Dispatch, SetStateAction } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { OfficeCalendarEventInput } from '../../types/officeCalendar'

type FieldsProps = {
  draft: OfficeCalendarEventInput
  setDraft: Dispatch<SetStateAction<OfficeCalendarEventInput>>
}

export function OfficeEventFormMetaFields({ draft, setDraft }: FieldsProps) {
  return (
    <>
      <div className="sm:col-span-2">
        <Label htmlFor="office-event-organizer">Organizer</Label>
        <Input
          id="office-event-organizer"
          className="mt-1"
          value={draft.organizerName}
          onChange={(e) => setDraft((state) => ({ ...state, organizerName: e.target.value }))}
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="office-event-description">Description</Label>
        <textarea
          id="office-event-description"
          className="mt-1 min-h-[4.5rem] w-full rounded-xl border border-hrms-border px-3 py-2 text-sm text-hrms-navy"
          value={draft.description}
          onChange={(e) => setDraft((state) => ({ ...state, description: e.target.value }))}
        />
      </div>
    </>
  )
}