/** Recruitment workspace prefix from the current URL. */
export type RecruitmentWorkspacePrefix = 'superadmin' | 'manager' | 'hradmin'

export function recruitmentRoutePrefix(
  pathname: string,
): RecruitmentWorkspacePrefix {
  if (pathname.startsWith('/superadmin')) return 'superadmin'
  if (pathname.startsWith('/hradmin')) return 'hradmin'
  return 'manager'
}

export function jobHiringDeskPath(
  prefix: RecruitmentWorkspacePrefix,
  jobId: string,
) {
  return `/${prefix}/recruitment/jobs/${encodeURIComponent(jobId)}/hiring`
}
