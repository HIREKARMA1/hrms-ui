/**
 * Submit encashment via POST /leave-encashments (server My Leave).
 */

import { Wallet } from 'lucide-react'

import type { LeaveTypeOption } from '../../api/leaveMappers'
import {
  LeaveDialogBody,
  LeaveDialogCloseButton,
  LeaveDialogContent,
  LeaveDialogFooter,
  LeaveDialogFooterActions,
  LeaveDialogHeader,
  LeaveDialogRoot,
} from '../shared/LeaveDialog'
import { RequestEncashmentDialogFields } from './RequestEncashmentDialogFields'
import { useApiRequestEncashmentDialog } from './useApiRequestEncashmentDialog'

type Props = {
  open: boolean
  employeeId: string
  leaveTypes: LeaveTypeOption[]
  balanceByCode: Record<string, number> | undefined
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ApiRequestEncashmentDialog({
  open,
  employeeId,
  leaveTypes,
  balanceByCode,
  onOpenChange,
  onSuccess,
}: Props) {
  const vm = useApiRequestEncashmentDialog(open, employeeId, leaveTypes, balanceByCode, onOpenChange, onSuccess)

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md">
        <LeaveDialogHeader
          title="Request encashment"
          subtitle="Encash unused paid leave. HR policy rules are applied when you submit."
          icon={Wallet}
        />
        <LeaveDialogBody className="space-y-4">
          {vm.noTypes ? (
            <p className="rounded-lg border border-hrms-border bg-hrms-muted-bg/50 px-4 py-3 text-sm text-hrms-text-secondary">
              No paid leave types are available to encash. Ask HR if you believe this is incorrect.
            </p>
          ) : (
            <>
              {vm.submitError ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
                  <p className="font-medium text-amber-950">Encashment not available</p>
                  <p className="mt-1 text-amber-900">{vm.submitError}</p>
                </div>
              ) : null}
              <RequestEncashmentDialogFields
                form={vm.form}
                encashableTypes={vm.encashableTypes}
                balance={vm.balance}
                after={vm.after}
                validationError={vm.validationError}
                onPatch={vm.patchForm}
              />
            </>
          )}
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions
            primaryLabel="Submit"
            primaryDisabled={Boolean(vm.validationError) || vm.saving || !vm.form.leaveTypeId || vm.noTypes}
            loading={vm.saving}
            onPrimary={() => void vm.handleSubmit()}
          />
        </LeaveDialogFooter>
        <LeaveDialogCloseButton />
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}