import { useMemo } from 'react'

import { getApiErrorMessage } from '@/services/api/errors'

import {
  useAssignEmployeeLeaveDefaultsMutation,
  useAssignEmployeeLeavePolicyMutation,
} from '../api/employeeLeavePoliciesApi'

export type PolicyActionResult = { ok: true } | { ok: false; message: string }

export function useEmployeeLeavePolicyActions() {
  const [assignPolicyMutation] = useAssignEmployeeLeavePolicyMutation()
  const [assignDefaultsMutation] = useAssignEmployeeLeaveDefaultsMutation()

  return useMemo(
    () => ({
      async assignPolicy(
        body: Parameters<typeof assignPolicyMutation>[0],
      ): Promise<PolicyActionResult> {
        try {
          await assignPolicyMutation(body).unwrap()
          return { ok: true }
        } catch (error) {
          return { ok: false, message: getApiErrorMessage(error, 'Could not save the employee leave policy.') }
        }
      },
      async assignDefaults(
        body: Parameters<typeof assignDefaultsMutation>[0],
      ): Promise<PolicyActionResult> {
        try {
          await assignDefaultsMutation(body).unwrap()
          return { ok: true }
        } catch (error) {
          return {
            ok: false,
            message: getApiErrorMessage(error, 'Could not assign company defaults for this employee.'),
          }
        }
      },
    }),
    [assignDefaultsMutation, assignPolicyMutation],
  )
}