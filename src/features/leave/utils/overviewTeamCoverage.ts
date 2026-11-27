/** True when org team-coverage limit is configured (not the server placeholder). */
export function isTeamCoverageConfigured(limit: number): boolean {
  return Number.isFinite(limit) && limit > 0 && limit < Number.MAX_SAFE_INTEGER
}