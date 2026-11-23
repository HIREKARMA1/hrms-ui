/**
 * Single place where Vite environment variables are read.
 * Everything else in the app should import from here.
 */
function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and set it.`,
    )
  }
  return value.trim()
}

/** Opt-in boolean flag: only the exact string `true` enables it. */
function readFlag(name: keyof ImportMetaEnv): boolean {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.trim().toLowerCase() === 'true'
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL').replace(/\/+$/, ''),
  /** Send employee profile photos to POST /uploads. Off unless explicitly enabled. */
  employeePhotoUploadEnabled: readFlag('VITE_EMPLOYEE_PHOTO_UPLOAD_ENABLED'),
} as const
