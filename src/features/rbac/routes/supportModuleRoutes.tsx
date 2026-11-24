import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import { AdminRequestsPage } from '@/features/support/pages/AdminRequestsPage'

import { RequireAccess } from '../components/RequireAccess'

/** HR support inbox for public contact-administrator requests (UI-only mock). */
export function createSupportModuleRoutes(): ReactElement {
  return (
    <Route
      key="manager-support-admin-requests"
      path="/manager/support/admin-requests"
      element={
        <RequireAccess
          feature="support.adminRequests"
          featureLabel="Admin Requests"
        >
          <AdminRequestsPage />
        </RequireAccess>
      }
    />
  )
}
