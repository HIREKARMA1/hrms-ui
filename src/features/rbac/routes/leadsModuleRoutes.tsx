import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import { LeadsPage } from '@/features/leads/pages/LeadsPage'

import { RequireAccess } from '../components/RequireAccess'

type OrgLeadsPrefix = 'superadmin' | 'admin' | 'hr'

export function createLeadsModuleRoutes(prefix: OrgLeadsPrefix): ReactElement[] {
  const feature = prefix === 'hr' ? 'leads.my' : 'leads.overview'
  return [
    <Route
      key={`${prefix}-leads`}
      path={`/${prefix}/leads`}
      element={
        <RequireAccess feature={feature} featureLabel="Leads Management">
          <LeadsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-leads-section`}
      path={`/${prefix}/leads/:section`}
      element={
        <RequireAccess feature={feature} featureLabel="Leads Management">
          <LeadsPage />
        </RequireAccess>
      }
    />,
  ]
}

export function createEmployeeLeadsModuleRoutes(): ReactElement[] {
  return [
    <Route
      key="employee-leads"
      path="/employee/leads"
      element={
        <RequireAccess feature="leads.my" featureLabel="My Leads">
          <LeadsPage />
        </RequireAccess>
      }
    />,
    <Route
      key="employee-leads-section"
      path="/employee/leads/:section"
      element={
        <RequireAccess feature="leads.my" featureLabel="My Leads">
          <LeadsPage />
        </RequireAccess>
      }
    />,
  ]
}