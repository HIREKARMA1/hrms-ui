import { Outlet } from 'react-router-dom'

import { RecruitmentProvider } from './RecruitmentProvider'

/** Wraps all recruitment routes so interviews sync across pages in the session. */
export function RecruitmentProviderLayout() {
  return (
    <RecruitmentProvider>
      <Outlet />
    </RecruitmentProvider>
  )
}