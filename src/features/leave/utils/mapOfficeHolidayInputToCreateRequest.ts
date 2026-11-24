import type { OfficeHolidayInput } from '@/features/officeCalendar/types/officeCalendar'

import type { CreateHolidayRequest } from '../types/api/holidayCreate.types'
import { mapOfficeHolidayTypeToApi } from './holidayTypeApiMap'

/** Maps office calendar form values → POST /holidays body. */
export function mapOfficeHolidayInputToCreateRequest(
  input: OfficeHolidayInput,
): CreateHolidayRequest {
  const body: CreateHolidayRequest = {
    name: input.name.trim(),
    holidayDate: input.date.slice(0, 10),
    type: mapOfficeHolidayTypeToApi(input.type),
  }

  const description = input.description.trim()
  if (description) body.description = description

  if (input.type === 'State' && input.state?.trim()) {
    body.state = input.state.trim()
  }

  if (input.departmentId) body.departmentId = input.departmentId
  if (input.branchId) body.branchId = input.branchId

  return body
}