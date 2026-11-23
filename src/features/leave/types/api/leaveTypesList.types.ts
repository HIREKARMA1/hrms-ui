/** Row from `GET /leave-types`. */
export type ApiLeaveTypeItem = {
  id: string
  code: string
  name?: string
  label?: string
  description?: string | null
  enabled?: boolean
  isActive?: boolean
  paid?: boolean
}

export type LeaveTypesListData = {
  items: ApiLeaveTypeItem[]
}