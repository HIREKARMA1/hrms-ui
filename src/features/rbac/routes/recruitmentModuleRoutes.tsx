import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import { ApplicationPipelinePage } from '@/features/recruitment/pages/ApplicationPipelinePage'
import { CandidatesPage } from '@/features/recruitment/pages/CandidatesPage'
import { InterviewFeedbackPage } from '@/features/recruitment/pages/InterviewFeedbackPage'
import { InterviewSchedulingPage } from '@/features/recruitment/pages/InterviewSchedulingPage'
import { JobHiringDeskPage } from '@/features/recruitment/pages/JobHiringDeskPage'
import { JobPostingsPage } from '@/features/recruitment/pages/JobPostingsPage'
import { OffersPage } from '@/features/recruitment/pages/OffersPage'
import { RecruitmentAnalyticsPage } from '@/features/recruitment/pages/RecruitmentAnalyticsPage'
import { RecruitmentOverviewPage } from '@/features/recruitment/pages/RecruitmentOverviewPage'
import { RecruitmentProviderLayout } from '@/features/recruitment/context/RecruitmentProviderLayout'

import { RequireAccess } from '../components/RequireAccess'

type RecruitmentPrefix = 'superadmin' | 'hr'

/** Recruitment & ATS on Super Admin and HR (/hr) workspaces. */
export function createRecruitmentModuleRoutes(
  prefix: RecruitmentPrefix,
): ReactElement {
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
      {/* Job Descriptions route hidden — JobDescriptionsPage.tsx retained */}
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