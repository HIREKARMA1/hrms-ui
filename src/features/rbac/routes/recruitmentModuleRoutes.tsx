import type { ReactElement } from 'react'
import { Navigate, Route } from 'react-router-dom'

import { ApplicationPipelinePage } from '@/features/recruitment/pages/ApplicationPipelinePage'
import { CandidatesPage } from '@/features/recruitment/pages/CandidatesPage'
import { InternalJobBoardPage } from '@/features/recruitment/pages/InternalJobBoardPage'
import { InterviewFeedbackPage } from '@/features/recruitment/pages/InterviewFeedbackPage'
import { InterviewSchedulingPage } from '@/features/recruitment/pages/InterviewSchedulingPage'
import { JobHiringDeskPage } from '@/features/recruitment/pages/JobHiringDeskPage'
import { JobPostingsPage } from '@/features/recruitment/pages/JobPostingsPage'
import { MyApplicationsPage } from '@/features/recruitment/pages/MyApplicationsPage'
import { OffersPage } from '@/features/recruitment/pages/OffersPage'
import { RecruitmentAnalyticsPage } from '@/features/recruitment/pages/RecruitmentAnalyticsPage'
import { RecruitmentOverviewPage } from '@/features/recruitment/pages/RecruitmentOverviewPage'
import { RecruitmentProviderLayout } from '@/features/recruitment/context/RecruitmentProviderLayout'

import { RequireAccess } from '../components/RequireAccess'

type AtsPrefix = 'superadmin' | 'hradmin'

/** Full Recruitment & ATS for Super Admin and HR Admin. */
export function createRecruitmentModuleRoutes(prefix: AtsPrefix | 'manager'): ReactElement {
  if (prefix === 'manager') {
    return createManagerInternalJobsRoutes()
  }

  return (
    <Route
      key={`${prefix}-recruitment-layout`}
      element={<RecruitmentProviderLayout />}
    >
      <Route
        path={`/${prefix}/recruitment`}
        element={
          <RequireAccess
            feature="recruitment.overview"
            featureLabel="Recruitment Overview"
          >
            <RecruitmentOverviewPage />
          </RequireAccess>
        }
      />
      <Route
        path={`/${prefix}/recruitment/jobs`}
        element={
          <RequireAccess feature="recruitment.jobs" featureLabel="Job Postings">
            <JobPostingsPage />
          </RequireAccess>
        }
      />
      <Route
        path={`/${prefix}/recruitment/jobs/:jobId/hiring`}
        element={
          <RequireAccess
            feature="recruitment.jobs"
            featureLabel="Job hiring desk"
          >
            <JobHiringDeskPage />
          </RequireAccess>
        }
      />
      <Route
        path={`/${prefix}/recruitment/candidates`}
        element={
          <RequireAccess feature="recruitment.candidates" featureLabel="Candidates">
            <CandidatesPage />
          </RequireAccess>
        }
      />
      <Route
        path={`/${prefix}/recruitment/pipeline`}
        element={
          <RequireAccess
            feature="recruitment.pipeline"
            featureLabel="Application Pipeline"
          >
            <ApplicationPipelinePage />
          </RequireAccess>
        }
      />
      <Route
        path={`/${prefix}/recruitment/interviews`}
        element={
          <RequireAccess
            feature="recruitment.interviews"
            featureLabel="Interview Scheduling"
          >
            <InterviewSchedulingPage />
          </RequireAccess>
        }
      />
      <Route
        path={`/${prefix}/recruitment/feedback`}
        element={
          <RequireAccess
            feature="recruitment.feedback"
            featureLabel="Interview Feedback"
          >
            <InterviewFeedbackPage />
          </RequireAccess>
        }
      />
      <Route
        path={`/${prefix}/recruitment/offers`}
        element={
          <RequireAccess
            feature="recruitment.offers"
            featureLabel="Offers & offer letters"
          >
            <OffersPage />
          </RequireAccess>
        }
      />
      <Route
        path={`/${prefix}/recruitment/analytics`}
        element={
          <RequireAccess
            feature="recruitment.analytics"
            featureLabel="Recruitment Analytics"
          >
            <RecruitmentAnalyticsPage />
          </RequireAccess>
        }
      />
    </Route>
  )
}

/** Manager: internal job board + own applications only (no job management). */
function createManagerInternalJobsRoutes(): ReactElement {
  return (
    <Route
      key="manager-recruitment-layout"
      element={<RecruitmentProviderLayout />}
    >
      <Route
        path="/manager/recruitment"
        element={<Navigate to="/manager/recruitment/jobs" replace />}
      />
      <Route
        path="/manager/recruitment/jobs"
        element={
          <RequireAccess feature="recruitment.jobs" featureLabel="Internal Jobs">
            <InternalJobBoardPage />
          </RequireAccess>
        }
      />
      <Route
        path="/manager/recruitment/applications"
        element={
          <RequireAccess feature="recruitment.jobs" featureLabel="My Applications">
            <MyApplicationsPage />
          </RequireAccess>
        }
      />
    </Route>
  )
}

/** Employee: internal job board + own applications. */
export function createEmployeeRecruitmentRoutes(): ReactElement {
  return (
    <Route
      key="employee-recruitment-layout"
      element={<RecruitmentProviderLayout />}
    >
      <Route
        path="/employee/recruitment"
        element={<Navigate to="/employee/recruitment/jobs" replace />}
      />
      <Route
        path="/employee/recruitment/jobs"
        element={
          <RequireAccess feature="recruitment.jobs" featureLabel="Internal Jobs">
            <InternalJobBoardPage />
          </RequireAccess>
        }
      />
      <Route
        path="/employee/recruitment/applications"
        element={
          <RequireAccess feature="recruitment.jobs" featureLabel="My Applications">
            <MyApplicationsPage />
          </RequireAccess>
        }
      />
    </Route>
  )
}
