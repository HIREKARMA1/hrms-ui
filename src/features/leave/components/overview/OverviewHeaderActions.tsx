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



  return (

  <>

      {permissions.canCreateOnBehalf ? (
        <Button type="button" onClick={() => setApplyOpen(true)}>

          Apply on behalf

        </Button>
      ) : null}

      {permissions.canRunAccrual ? (
        <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => setAccrualOpen(true)}>

          Run accrual

        </Button>
      ) : null}

      <Button type="button" variant="outline" className={cn(LEAVE_SECONDARY_BUTTON)} onClick={() => onNavigate('Reports')}>

        Download report

      </Button>

      {isSuperAdminExperience(viewer.role) ? <OverviewSuperAdminActions /> : null}

      <HrApplyOnBehalfDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        snapshot={snapshot}
        submitterName={viewer.displayName}
        onSubmit={async (employeeId, input) => {

          const employee = snapshot.employees.find((item) => item.id === employeeId)

          if (!employee) return

          await applyOnBehalf(employee, input)

          showToast('Request submitted on behalf.')

          setApplyOpen(false)

        }}

      />

      <OverviewRunAccrualDialog open={accrualOpen} onOpenChange={setAccrualOpen} />

    </>

  )

}


