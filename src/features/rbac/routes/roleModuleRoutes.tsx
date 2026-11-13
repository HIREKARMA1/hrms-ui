import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import { AttendanceCorrectionsPage } from '@/features/attendance/pages/AttendanceCorrectionsPage'
import { AttendanceOverviewPage } from '@/features/attendance/pages/AttendanceOverviewPage'
import { AttendanceReportsPage } from '@/features/attendance/pages/AttendanceReportsPage'
import { AttendanceSettingsPage } from '@/features/attendance/pages/AttendanceSettingsPage'
import { CheckInPage } from '@/features/attendance/pages/CheckInPage'
import { DailyAttendancePage } from '@/features/attendance/pages/DailyAttendancePage'
import { HolidayPage } from '@/features/attendance/pages/HolidayPage'
import { OvertimePage } from '@/features/attendance/pages/OvertimePage'
import { RegularizationPage } from '@/features/attendance/pages/RegularizationPage'
import { WeeklyOffPage } from '@/features/attendance/pages/WeeklyOffPage'
import { EmployeeOverviewPage } from '@/features/employees/pages/EmployeeOverviewPage'
import { ApplicationPipelinePage } from '@/features/recruitment/pages/ApplicationPipelinePage'
import { CandidatesPage } from '@/features/recruitment/pages/CandidatesPage'
import { InterviewFeedbackPage } from '@/features/recruitment/pages/InterviewFeedbackPage'
import { InterviewSchedulingPage } from '@/features/recruitment/pages/InterviewSchedulingPage'
import { JobDescriptionsPage } from '@/features/recruitment/pages/JobDescriptionsPage'
import { JobPostingsPage } from '@/features/recruitment/pages/JobPostingsPage'
import { OffersPage } from '@/features/recruitment/pages/OffersPage'
import { RecruitmentAnalyticsPage } from '@/features/recruitment/pages/RecruitmentAnalyticsPage'
import { RecruitmentOverviewPage } from '@/features/recruitment/pages/RecruitmentOverviewPage'

import { RequireAccess } from '../components/RequireAccess'

type RolePrefix = 'superadmin' | 'admin' | 'hr'

/**
 * Reuses existing Employee + Attendance + Recruitment pages under each role prefix.
 * Does not duplicate feature modules.
 */
export function createOrgRoleModuleRoutes(prefix: RolePrefix): ReactElement[] {
  return [
    <Route
      key={`${prefix}-employees`}
      path={`/${prefix}/employees`}
      element={
        <RequireAccess feature="employee.overview" featureLabel="Employee Management">
          <EmployeeOverviewPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance`}
      path={`/${prefix}/attendance`}
      element={
        <RequireAccess feature="attendance.overview" featureLabel="Attendance Overview">
          <AttendanceOverviewPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-daily`}
      path={`/${prefix}/attendance/daily`}
      element={
        <RequireAccess feature="attendance.daily" featureLabel="Daily Attendance">
          <DailyAttendancePage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-check-in`}
      path={`/${prefix}/attendance/check-in`}
      element={
        <RequireAccess feature="attendance.checkIn" featureLabel="Check-in / Check-out">
          <CheckInPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-corrections`}
      path={`/${prefix}/attendance/corrections`}
      element={
        <RequireAccess
          feature="attendance.corrections"
          featureLabel="Attendance Corrections"
        >
          <AttendanceCorrectionsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-regularization`}
      path={`/${prefix}/attendance/regularization`}
      element={
        <RequireAccess
          feature="attendance.regularization"
          featureLabel="Attendance Regularization"
        >
          <RegularizationPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-overtime`}
      path={`/${prefix}/attendance/overtime`}
      element={
        <RequireAccess feature="attendance.overtime" featureLabel="Overtime Management">
          <OvertimePage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-weekly-off`}
      path={`/${prefix}/attendance/weekly-off`}
      element={
        <RequireAccess feature="attendance.weeklyOff" featureLabel="Weekly Off Management">
          <WeeklyOffPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-holidays`}
      path={`/${prefix}/attendance/holidays`}
      element={
        <RequireAccess feature="attendance.holidays" featureLabel="Holiday Management">
          <HolidayPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-reports`}
      path={`/${prefix}/attendance/reports`}
      element={
        <RequireAccess feature="attendance.reports" featureLabel="Attendance Reports">
          <AttendanceReportsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-attendance-settings`}
      path={`/${prefix}/attendance/settings`}
      element={
        <RequireAccess feature="attendance.settings" featureLabel="Attendance Settings">
          <AttendanceSettingsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment`}
      path={`/${prefix}/recruitment`}
      element={
        <RequireAccess
          feature="recruitment.overview"
          featureLabel="Recruitment Overview"
        >
          <RecruitmentOverviewPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment-jobs`}
      path={`/${prefix}/recruitment/jobs`}
      element={
        <RequireAccess feature="recruitment.jobs" featureLabel="Job Postings">
          <JobPostingsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment-job-descriptions`}
      path={`/${prefix}/recruitment/job-descriptions`}
      element={
        <RequireAccess
          feature="recruitment.jobDescriptions"
          featureLabel="Job Descriptions"
        >
          <JobDescriptionsPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment-candidates`}
      path={`/${prefix}/recruitment/candidates`}
      element={
        <RequireAccess feature="recruitment.candidates" featureLabel="Candidates">
          <CandidatesPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment-pipeline`}
      path={`/${prefix}/recruitment/pipeline`}
      element={
        <RequireAccess
          feature="recruitment.pipeline"
          featureLabel="Application Pipeline"
        >
          <ApplicationPipelinePage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment-interviews`}
      path={`/${prefix}/recruitment/interviews`}
      element={
        <RequireAccess
          feature="recruitment.interviews"
          featureLabel="Interview Scheduling"
        >
          <InterviewSchedulingPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment-feedback`}
      path={`/${prefix}/recruitment/feedback`}
      element={
        <RequireAccess
          feature="recruitment.feedback"
          featureLabel="Interview Feedback"
        >
          <InterviewFeedbackPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment-offers`}
      path={`/${prefix}/recruitment/offers`}
      element={
        <RequireAccess feature="recruitment.offers" featureLabel="Offers">
          <OffersPage />
        </RequireAccess>
      }
    />,
    <Route
      key={`${prefix}-recruitment-analytics`}
      path={`/${prefix}/recruitment/analytics`}
      element={
        <RequireAccess
          feature="recruitment.analytics"
          featureLabel="Recruitment Analytics"
        >
          <RecruitmentAnalyticsPage />
        </RequireAccess>
      }
    />,
  ]
}
