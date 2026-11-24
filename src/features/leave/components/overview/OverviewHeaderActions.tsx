/**

 * Quick actions in the HR Overview title row.

 */



import { useState } from 'react'



import { Button } from '@/components/ui/button'



import type { LeaveSnapshot } from '../../services/leaveService'

import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'

import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveViewer } from '../../hooks/useLeaveViewer'
import { isSuperAdminExperience } from '../../constants/userRoles'
import { OverviewSuperAdminActions } from '../superAdmin/OverviewSuperAdminActions'

import { useHrRequestActions } from '../../hooks/useHrRequestActions'

import { useLeave } from '../../hooks/useLeave'

import { useLeaveToast } from '../../hooks/useLeaveToast'

import { LEAVE_SECONDARY_BUTTON } from '../shared/leaveUi'

import { HrApplyOnBehalfDialog } from '../hrRequests/HrApplyOnBehalfDialog'

import { OverviewRunAccrualDialog } from './OverviewRunAccrualDialog'

import { cn } from '@/lib/utils'



export function OverviewHeaderActions({ snapshot, onNavigate }: { snapshot: LeaveSnapshot; onNavigate: HrOverviewNavigate }) {

  const { reload } = useLeave()

  const { viewer } = useLeaveViewer()

  const { showToast } = useLeaveToast()

  const permissions = useLeavePermissions()

  const { applyOnBehalf } = useHrRequestActions(snapshot, viewer, reload)

  const [applyOpen, setApplyOpen] = useState(false)

  const [accrualOpen, setAccrualOpen] = useState(false)

  const [applying, setApplying] = useState(false)

  const fromServer = Boolean(snapshot.api)



  return (

  <>

      {permissions.canCreateOnBehalf ? (
        <Button type="button" onClick={() => setApplyOpen(true)}>

          Apply on behalf

        </Button>
      ) : null}

      {permissions.canRunAccrual ? (
        <Button
          type="button"
          variant="outline"
          className={cn(LEAVE_SECONDARY_BUTTON)}
          onClick={() => (fromServer ? onNavigate('Accruals & Year-End', { accrualConfirm: true }) : setAccrualOpen(true))}
        >

          Run accrual

        </Button>
      ) : null}

      <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => onNavigate('Reports')}>

        Download report

      </Button>

      {isSuperAdminExperience(viewer.role) && !fromServer ? <OverviewSuperAdminActions /> : null}

      <HrApplyOnBehalfDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        snapshot={snapshot}
        submitterName={viewer.displayName}
        saving={applying}
        onSubmit={async (employeeId, input) => {

          const employee = snapshot.employees.find((item) => item.id === employeeId)

          if (!employee) return false

          setApplying(true)

          const result = await applyOnBehalf(employee, input)

          setApplying(false)

          showToast(result.ok ? 'Request submitted on behalf.' : result.message)

          return result.ok

        }}

      />

      {fromServer ? null : <OverviewRunAccrualDialog open={accrualOpen} onOpenChange={setAccrualOpen} />}

    </>

  )

}
