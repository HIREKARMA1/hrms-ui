import type { AttendanceRegularizationListQuery } from '../types/api/attendanceRegularization.types'
import {
  useCreateAttendanceRegularizationMutation,
  useListAttendanceRegularizationsQuery,
  useRevokeAttendanceRegularizationMutation,
} from '../api/attendanceRegularizationApi'
import { useAttendancePermissions } from './useAttendancePermissions'

export function useAttendanceRegularizationList(
  query: AttendanceRegularizationListQuery = {},
  options?: { skip?: boolean },
) {
  const { canRegularize } = useAttendancePermissions()
  return useListAttendanceRegularizationsQuery(query, {
    skip: (options?.skip ?? false) || !canRegularize,
  })
}

export function useAttendanceRegularizationMutations() {
  const { canRegularize } = useAttendancePermissions()
  const [createRegularization, createState] = useCreateAttendanceRegularizationMutation()
  const [revokeRegularization, revokeState] = useRevokeAttendanceRegularizationMutation()
  return {
    createRegularization,
    revokeRegularization,
    canRegularize,
    isCreating: createState.isLoading,
    isRevoking: revokeState.isLoading,
  }
}