/**
 * Attendance → Weekly Off Management: company policy via /calendar/weekly-offs.
 */
import { ToastBanner, useToast } from '@/hooks/useToast'

import { WeeklyOffAccessBanner } from '../components/weeklyOff/WeeklyOffAccessBanner'
import { WeeklyOffDatesPreview } from '../components/weeklyOff/WeeklyOffDatesPreview'
import { WeeklyOffPolicyEditor } from '../components/weeklyOff/WeeklyOffPolicyEditor'
import { WeeklyOffPolicyStatus } from '../components/weeklyOff/WeeklyOffPolicyStatus'
import { useWeeklyOffPolicyForm } from '../hooks/useWeeklyOffPolicyForm'

export function WeeklyOffPage() {
  const { message, toast } = useToast()
  const form = useWeeklyOffPolicyForm()

  const handleSave = async () => {
    const err = await form.save()
    if (err) {
      toast(err)
      return
    }
    toast('Weekly-off policy saved.')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <ToastBanner message={message} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Weekly Off</h1>
        {form.policyUpdatedAt ? (
          <p className="mt-1 text-xs text-text-secondary">
            Last updated: {new Date(form.policyUpdatedAt).toLocaleString()}
          </p>
        ) : null}
      </div>

      <WeeklyOffAccessBanner canFetch={form.canFetch} canConfigure={form.canConfigure} />

      <WeeklyOffPolicyStatus
        canFetch={form.canFetch}
        isFetching={form.isFetching}
        isError={form.isError}
        onRetry={() => void form.refetch()}
      />

      {form.policyReady ? (
        <WeeklyOffPolicyEditor
          rules={form.draftRules}
          canConfigure={form.canConfigure}
          isDirty={form.isDirty}
          isSaving={form.isSaving}
          onAdd={form.addRule}
          onChange={form.setRuleAt}
          onRemove={form.removeRule}
          onReset={form.resetDraft}
          onSave={() => void handleSave()}
        />
      ) : null}

      <WeeklyOffDatesPreview />
    </div>
  )
}

export default WeeklyOffPage