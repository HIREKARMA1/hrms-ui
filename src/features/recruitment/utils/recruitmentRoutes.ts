/** Recruitment workspace prefix from the current URL. */
export type RecruitmentWorkspacePrefix =
  | 'superadmin'
  | 'manager'
  | 'hradmin'
  | 'employee'

/** @deprecated Prefer recruitmentWorkspacePrefix — kept for hiring desk callers. */
export type RecruitmentRoutePrefix = 'superadmin' | 'manager' | 'hradmin'

export function recruitmentWorkspacePrefix(pathname: string): RecruitmentWorkspacePrefix {
  if (pathname.startsWith('/superadmin')) return 'superadmin'
  if (pathname.startsWith('/hradmin')) return 'hradmin'
  if (pathname.startsWith('/employee')) return 'employee'
  return 'manager'
}

export function recruitmentRoutePrefix(pathname: string): RecruitmentRoutePrefix {
  const prefix = recruitmentWorkspacePrefix(pathname)
  return prefix === 'employee' ? 'manager' : prefix
}

export function jobHiringDeskPath(
  prefix: RecruitmentRoutePrefix,
  jobId: string,
) {
  return `/${prefix}/recruitment/jobs/${encodeURIComponent(jobId)}/hiring`
}

export function internalJobsPath(prefix: RecruitmentWorkspacePrefix) {
  return `/${prefix}/recruitment/jobs`
}

export function internalApplicationsPath(prefix: RecruitmentWorkspacePrefix) {
  return `/${prefix}/recruitment/applications`
}
