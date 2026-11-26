/**
 * Create encashment policy (POST /leave-encashments/policies).
 */

import { BadgeIndianRupee } from 'lucide-react'

import type { CreateEncashmentPolicyBody } from '../../api/leaveApi.types'
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
import { EncashmentPolicyFormBody } from './policyDialog/EncashmentPolicyFormBody'
import { PolicySaveErrorBanner } from './policyDialog/PolicyDialogShared'
import { useApiEncashmentPolicyDialog } from './useApiEncashmentPolicyDialog'

type Props = {
  open: boolean
  leaveTypes: LeaveTypeOption[]
  saveError?: string | null
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onClearSaveError?: () => void
  onSubmit: (body: CreateEncashmentPolicyBody) => void
}

export function ApiEncashmentPolicyDialog({
  open,
  leaveTypes,
  saveError,
  loading,
  onOpenChange,
  onClearSaveError,
  onSubmit,
}: Props) {
  const vm = useApiEncashmentPolicyDialog(open, leaveTypes, onClearSaveError, onSubmit)

  return (
    <LeaveDialogRoot open={open} onOpenChange={onOpenChange}>
      <LeaveDialogContent size="md" className="shadow-xl">
        <LeaveDialogCloseButton />
        <LeaveDialogHeader
          title="Add encashment policy"
          subtitle="Set payout rate and day limits for paid leave types only."
          icon={BadgeIndianRupee}
        />
        <LeaveDialogBody className="space-y-4">
          {saveError ? <PolicySaveErrorBanner message={saveError} /> : null}
          {vm.encashableTypes.length === 0 ? (
            <p className="rounded-lg border border-hrms-border bg-hrms-muted-bg/50 px-4 py-3 text-sm text-hrms-text-secondary">
              No paid active leave types are available. Add or activate a paid leave type under Leave Settings before
              creating an encashment policy.
            </p>
          ) : (
            <EncashmentPolicyFormBody
              form={vm.form}
              loading={loading}
              encashableTypes={vm.encashableTypes}
              typeErr={vm.typeErr}
              rateErr={vm.rateErr}
              fromErr={vm.fromErr}
              setForm={vm.patchForm}
              onBlurType={() => vm.setTouched((prev) => ({ ...prev, leaveType: true }))}
              onBlurRate={() => vm.setTouched((prev) => ({ ...prev, rate: true }))}
              onBlurFrom={() => vm.setTouched((prev) => ({ ...prev, from: true }))}
            />
          )}
        </LeaveDialogBody>
        <LeaveDialogFooter>
          <LeaveDialogFooterActions
            primaryLabel="Save policy"
            primaryDisabled={!vm.canSave || loading}
            loading={loading}
            onPrimary={vm.handleSubmit}
          />
        </LeaveDialogFooter>
      </LeaveDialogContent>
    </LeaveDialogRoot>
  )
}