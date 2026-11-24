/**
 * Regularization page: list, create (POST), revoke (DELETE).
 */
import { useCallback, useMemo, useState } from 'react'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { useOptionalRbacSession } from '@/features/rbac/hooks/useRbacSession'
import { getApiErrorMessage } from '@/services/api/errors'

import type { AttendanceRegularizationFormValues } from '../components/regularization/AttendanceRegularizationForm'
import {
  useAttendanceRegularizationList,
  useAttendanceRegularizationMutations,
} from './useAttendanceRegularizationQueries'

export function useAttendanceRegularizationPage() {
  const { user } = useAuthenticatedUser()
  const rbac = useOptionalRbacSession()
  const isEmployeeWorkspace = rbac?.roleCode === 'EMPLOYEE'
  const linkedEmployeeId = user?.employeeId ?? ''

  const listQuery = useMemo(
    () => ({
      page: 1,
      limit: 50,
      includeRevoked: true,
      ...(isEmployeeWorkspace && linkedEmployeeId ? { employeeId: linkedEmployeeId } : {}),
    }),
    [isEmployeeWorkspace, linkedEmployeeId],
  )

  const list = useAttendanceRegularizationList(listQuery)
  const { createRegularization, revokeRegularization, canRegularize, isCreating, isRevoking } =
    useAttendanceRegularizationMutations()

  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null)

  const createTargetEmployeeId = useCallback(
    (values: AttendanceRegularizationFormValues) =>
      isEmployeeWorkspace ? linkedEmployeeId : values.employeeId.trim(),
    [isEmployeeWorkspace, linkedEmployeeId],
  )

  const submitCreate = useCallback(
    async (values: AttendanceRegularizationFormValues) => {
      if (!canRegularize) return { ok: false as const, message: 'Permission denied.' }
      const employeeId = createTargetEmployeeId(values)
      if (!employeeId) {
        return {
          ok: false as const,
          message: isEmployeeWorkspace
            ? 'Your login is not linked to an employee record.'
            : 'Employee ID is required.',
        }
      }
      if (!values.type) return { ok: false as const, message: 'Type is required.' }
      try {
        await createRegularization({
          employeeId,
          body: {
            type: values.type,
            dates: [values.attendanceDate],
            reason: values.reason.trim(),
          },
        }).unwrap()
        await list.refetch()
        return { ok: true as const, message: 'Regularization submitted.' }
      } catch (error) {
        return { ok: false as const, message: getApiErrorMessage(error, 'Could not submit.') }
      }
    },
    [canRegularize, createRegularization, createTargetEmployeeId, isEmployeeWorkspace, list],
  )

  const confirmRevoke = useCallback(
    async (reason: string) => {
      if (!revokeTargetId) return { ok: false as const, message: 'No record selected.' }
      try {
        await revokeRegularization({ id: revokeTargetId, body: { reason } }).unwrap()
        setRevokeTargetId(null)
        await list.refetch()
        return { ok: true as const, message: 'Regularization revoked.' }
      } catch (error) {
        return { ok: false as const, message: getApiErrorMessage(error, 'Could not revoke.') }
      }
    },
    [list, revokeRegularization, revokeTargetId],
  )

  return {
    isEmployeeWorkspace,
    linkedEmployeeId,
    canRegularize,
    list,
    items: list.data?.items ?? [],
    isCreating,
    isRevoking,
    revokeTargetId,
    setRevokeTargetId,
    submitCreate,
    confirmRevoke,
  }
}