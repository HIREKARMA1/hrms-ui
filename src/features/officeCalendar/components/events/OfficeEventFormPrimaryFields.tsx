import type { Dispatch, SetStateAction } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { OfficeCalendarEventInput, OfficeEventFormType } from '../../types/officeCalendar'
import { OFFICE_EVENT_FORM_TYPES, OFFICE_EVENT_SELECT_CLASS } from './officeEventFormConstants'

type FieldsProps = {
  draft: OfficeCalendarEventInput
  setDraft: Dispatch<SetStateAction<OfficeCalendarEventInput>>
}

export function OfficeEventFormPrimaryFields({ draft, setDraft }: FieldsProps) {
  return (
    <>
      <div className="sm:col-span-2">
        <Label htmlFor="office-event-title">Title</Label>
        <Input
          id="office-event-title"
          className="mt-1"
          value={draft.title}
          onChange={(e) => setDraft((state) => ({ ...state, title: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="office-event-type">Type</Label>
        <select
          id="office-event-type"
          className={OFFICE_EVENT_SELECT_CLASS}
          value={draft.type === 'holiday' ? 'event' : draft.type}
          onChange={(e) =>
            setDraft((state) => ({
              ...state,
              type: e.target.value as OfficeEventFormType,
            }))
          }
        >
          {OFFICE_EVENT_FORM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="office-event-visibility">Visibility</Label>
        <select
          id="office-event-visibility"
          className={OFFICE_EVENT_SELECT_CLASS}
          value={draft.visibility}
          onChange={(e) =>
            setDraft((state) => ({
              ...state,
              visibility: e.target.value as OfficeCalendarEventInput['visibility'],
            }))
          }
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      <div>
        <Label htmlFor="office-event-start">Start date</Label>
        <Input
          id="office-event-start"
          type="date"
          className="mt-1"
          value={draft.startDate}
          onChange={(e) =>
            setDraft((state) => ({
              ...state,
              startDate: e.target.value,
              endDate: state.endDate < e.target.value ? e.target.value : state.endDate,
            }))
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="office-event-end">End date</Label>
        <Input
          id="office-event-end"
          type="date"
          className="mt-1"
          value={draft.endDate}
          min={draft.startDate}
          onChange={(e) => setDraft((state) => ({ ...state, endDate: e.target.value }))}
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-hrms-navy sm:col-span-2">
        <input
          type="checkbox"
          checked={draft.allDay}
          onChange={(e) => setDraft((state) => ({ ...state, allDay: e.target.checked }))}
        />
        All day
      </label>
      {!draft.allDay ? (
        <>
          <div>
            <Label htmlFor="office-event-start-time">Start time</Label>
            <Input
              id="office-event-start-time"
              type="time"
              className="mt-1"
              value={draft.startTime ?? ''}
              onChange={(e) => setDraft((state) => ({ ...state, startTime: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="office-event-end-time">End time</Label>
            <Input
              id="office-event-end-time"
              type="time"
              className="mt-1"
              value={draft.endTime ?? ''}
              onChange={(e) => setDraft((state) => ({ ...state, endTime: e.target.value }))}
            />
          </div>
        </>
      ) : null}
    </>
  )
}