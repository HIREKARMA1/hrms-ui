/** Recruitment workspace prefix from current URL (/hr or /superadmin). */
export function recruitmentRoutePrefix(pathname: string): 'hr' | 'superadmin' {
  return pathname.startsWith('/superadmin') ? 'superadmin' : 'hr'
}

export function jobHiringDeskPath(prefix: 'hr' | 'superadmin', jobId: string) {
  return `/${prefix}/recruitment/jobs/${jobId}/hiring`
}