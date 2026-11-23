import type { ReactElement } from 'react'

import { Route } from 'react-router-dom'



import { OfficeCalendarPage } from '@/features/officeCalendar/pages/OfficeCalendarPage'



import { RequireAccess } from '../components/RequireAccess'



type OrgCalendarPrefix = 'superadmin' | 'admin' | 'hr'



export function createOfficeCalendarModuleRoutes(prefix: OrgCalendarPrefix): ReactElement[] {

  return [

    <Route

      key={`${prefix}-calendar`}

      path={`/${prefix}/calendar`}

      element={

        <RequireAccess feature="calendar.view" featureLabel="Office Calendar">

          <OfficeCalendarPage />

        </RequireAccess>

      }

    />,

    <Route

      key={`${prefix}-calendar-section`}

      path={`/${prefix}/calendar/:section`}

      element={

        <RequireAccess feature="calendar.view" featureLabel="Office Calendar">

          <OfficeCalendarPage />

        </RequireAccess>

      }

    />,

  ]

}



export function createEmployeeCalendarModuleRoutes(): ReactElement[] {

  return [

    <Route

      key="employee-calendar"

      path="/employee/calendar"

      element={

        <RequireAccess feature="calendar.view" featureLabel="Office Calendar">

          <OfficeCalendarPage />

        </RequireAccess>

      }

    />,

    <Route

      key="employee-calendar-section"

      path="/employee/calendar/:section"

      element={

        <RequireAccess feature="calendar.view" featureLabel="Office Calendar">

          <OfficeCalendarPage />

        </RequireAccess>

      }

    />,

  ]

}
