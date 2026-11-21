import type { ApiHolidayType } from '../../utils/holidayTypeApiMap'

/** Body for POST /holidays and PATCH /holidays/{id}. */
export type CreateHolidayRequest = {
  name: string
  holidayDate: string
  /** Backend enum: NATIONAL | STATE | REGIONAL | FESTIVAL | COMPANY | OPTIONAL (legacy: PUBLIC) */
  type: ApiHolidayType
  description?: string
  state?: string
  departmentId?: string | null
  branchId?: string | null
}

export type UpdateHolidayRequest = CreateHolidayRequest