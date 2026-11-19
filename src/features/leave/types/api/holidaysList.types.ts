/** Query for `GET /holidays`. */
export type HolidaysListQuery = {
  year: number
}

export type ApiHolidayItem = {
  id: string
  name?: string
  title?: string
  date?: string
  holidayDate?: string
  type?: string
  holidayType?: string
  state?: string
  departmentId?: string | null
  branchId?: string | null
  mandatory?: boolean
  description?: string
}

export type HolidaysListData = {
  items: ApiHolidayItem[]
}