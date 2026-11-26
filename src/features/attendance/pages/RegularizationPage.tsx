/**
 * Attendance regularization — APIs #7–#9 (create, list, revoke).
 */
import { ToastBanner, useToast } from '@/hooks/useToast'

import { AttendanceRegularizationForm } from '../components/regularization/AttendanceRegularizationForm'
import { AttendanceRegularizationList } from '../components/regularization/AttendanceRegularizationList'
import { RevokeRegularizationDialog } from '../components/regularization/RevokeRegularizationDialog'
import { useAttendanceRegularizationPage } from '../hooks/useAttendanceRegularizationPage'

export function RegularizationPage() {
  const { message, toast } = useToast()
  const page = useAttendanceRegularizationPage()

  const handleCreate = async (values: Parameters<typeof page.submitCreate>[0]) => {
    const outcome = await page.submitCreate(values)
    toast(outcome.message)
  }

  const handleRevoke = async (reason: string) => {
    const outcome = await page.confirmRevoke(reason)
    toast(outcome.message)
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <ToastBanner message={message} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Attendance Regularization</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Pick employee and date — the type list matches Reports → Issues for that day. After submit, refresh Reports
          to see waived issues.
        </p>
      </div>

      {!page.canRegularize ? (
        <p className="text-sm text-text-secondary">You do not have attendance:regularize permission.</p>
      ) : null}

      {page.isEmployeeWorkspace && !page.linkedEmployeeId ? (
        <p className="text-sm text-amber-700">
          Your account has no linked employeeId — POST regularizations requires an employee record on
          login.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
        <AttendanceRegularizationForm
          showEmployeeIdField={!page.isEmployeeWorkspace}
          defaultEmployeeId=""
          disabled={!page.canRegularize || page.isCreating}
          isEmployeeWorkspace={page.isEmployeeWorkspace}
          linkedEmployeeId={page.linkedEmployeeId}
          onSubmit={handleCreate}
        />

        <AttendanceRegularizationList
          items={page.items}
          isLoading={page.list.isLoading}
          isFetching={page.list.isFetching}
          isError={page.list.isError}
          error={page.list.error}
          canRevoke={page.canRegularize}
          onRevoke={(id) => page.setRevokeTargetId(id)}
          onRefresh={() => void page.list.refetch()}
        />
      </div>

      <RevokeRegularizationDialog
        open={Boolean(page.revokeTargetId)}
        saving={page.isRevoking}
        onOpenChange={(open) => {
          if (!open) page.setRevokeTargetId(null)
        }}
        onConfirm={handleRevoke}
      />
    </div>
  )
}

export default RegularizationPage