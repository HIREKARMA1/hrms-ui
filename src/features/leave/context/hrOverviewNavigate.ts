/**

 * Navigation payload from HR Overview cards to other leave tabs.

 */



import type { HrRequestsSegment } from './leavePageNavTypes'

import type { LeavePageTabId } from '../hooks/useLeavePageTabs'

import type { LeaveTypeCode } from '../constants/leaveTypeCodes'



export type HrOverviewNavigateOpts = {

  segment?: HrRequestsSegment

  accrualConfirm?: boolean

  requestsSearch?: string

  leaveTypeCode?: LeaveTypeCode

  calendarDepartment?: string

}



export type HrOverviewNavigate = (

  tab: Extract<
    LeavePageTabId,
    'Requests' | 'Calendar' | 'Balances' | 'Accruals & Year-End' | 'Reports' | 'Audit'
  >,

  opts?: HrOverviewNavigateOpts,

) => void


