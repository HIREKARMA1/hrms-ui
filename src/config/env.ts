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

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL').replace(/\/+$/, ''),
} as const
