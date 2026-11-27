/**
 * Role-specific stat row for My Leave (employee, manager, or default).
 */

import type { CompOffLot } from '../../types/compOff'
import type { LeaveRequest } from '../../types/leaveRequest'
import type { LeaveSnapshot } from '../../services/leaveService'
import type { LinkedLeaveViewer } from '../../types/viewer'
import { isEmployeeExperience, isManagerExperience } from '../../constants/userRoles'
import type { BalanceCardModel } from './MyLeaveBalanceCards'
import { MyLeaveEmployeeOverview } from './MyLeaveEmployeeOverview'
import { MyLeaveManagerOverview } from './MyLeaveManagerOverview'
import { MyLeaveTabOverview } from './MyLeaveTabOverview'

type MyLeaveTabOverviewSectionProps = {
  viewer: LinkedLeaveViewer
  snapshot: LeaveSnapshot
  cards: BalanceCardModel[]
  requests: LeaveRequest[]
  compOffLots: CompOffLot[]
  statsLoading?: boolean
}

export function MyLeaveTabOverviewSection({
  viewer,
  snapshot,
  cards,
  requests,
  compOffLots,
  statsLoading = false,
}: MyLeaveTabOverviewSectionProps) {
  if (isEmployeeExperience(viewer.role)) {
    return (
      <MyLeaveEmployeeOverview
        cards={cards}
        requests={requests}
        compOffLots={compOffLots}
        employeeId={viewer.employeeId}
        apiMode={Boolean(snapshot.api)}
        loading={statsLoading}
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
