/**

 * Quick actions in the HR Overview title row.

 */



import { useState } from 'react'

import { Download, Plus, RefreshCw } from 'lucide-react'



import type { LeaveSnapshot } from '../../services/leaveService'

import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'

import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { useLeaveViewer } from '../../hooks/useLeaveViewer'
import { isSuperAdminExperience } from '../../constants/userRoles'
import { OverviewSuperAdminActions } from '../superAdmin/OverviewSuperAdminActions'

import { useHrRequestActions } from '../../hooks/useHrRequestActions'

import { useLeave } from '../../hooks/useLeave'

import { useLeaveToast } from '../../hooks/useLeaveToast'

import { OV_BTN_PRIMARY, OV_BTN_SECONDARY, OV_FOCUS } from './overviewVisual'

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
        <button type="button" className={cn(OV_BTN_PRIMARY, OV_FOCUS)} onClick={() => setApplyOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          Apply on behalf
        </button>
      ) : null}

      {permissions.canRunAccrual ? (
        <button
          type="button"
          className={cn(OV_BTN_SECONDARY, OV_FOCUS)}
          onClick={() => (fromServer ? onNavigate('Accruals & Year-End', { accrualConfirm: true }) : setAccrualOpen(true))}
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Run accrual
        </button>
      ) : null}

      <button type="button" className={cn(OV_BTN_SECONDARY, OV_FOCUS)} onClick={() => onNavigate('Reports')}>
        <Download className="h-4 w-4" aria-hidden />
        Download report
      </button>

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
