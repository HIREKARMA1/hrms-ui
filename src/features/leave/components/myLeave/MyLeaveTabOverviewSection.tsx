/**
 * Role-specific stat row for My Leave (employee, manager, or default).
 */

import type { CompOffLot } from '../../types/compOff'
import type { LeaveRequest } from '../../types/leaveRequest'
import type { LeaveSnapshot } from '../../services/leaveService'
import type { LeaveViewer } from '../../types/viewer'
import { isEmployeeExperience, isManagerExperience } from '../../constants/userRoles'
import type { BalanceCardModel } from './MyLeaveBalanceCards'
import { MyLeaveEmployeeOverview } from './MyLeaveEmployeeOverview'
import { MyLeaveManagerOverview } from './MyLeaveManagerOverview'
import { MyLeaveTabOverview } from './MyLeaveTabOverview'

type MyLeaveTabOverviewSectionProps = {
  viewer: LeaveViewer
  snapshot: LeaveSnapshot
  cards: BalanceCardModel[]
  requests: LeaveRequest[]
  compOffLots: CompOffLot[]
}

export function MyLeaveTabOverviewSection({
  viewer,
  snapshot,
  cards,
  requests,
  compOffLots,
}: MyLeaveTabOverviewSectionProps) {
  if (isEmployeeExperience(viewer.role)) {
    return (
      <MyLeaveEmployeeOverview
        cards={cards}
        requests={requests}
        compOffLots={compOffLots}
        employeeId={viewer.employeeId}
      />
    )
  }
  if (isManagerExperience(viewer.role)) {
    return <MyLeaveManagerOverview snapshot={snapshot} viewer={viewer} cards={cards} />
  }
  return (
    <MyLeaveTabOverview cards={cards} requests={requests} compOffLots={compOffLots} employeeId={viewer.employeeId} />
  )
}
