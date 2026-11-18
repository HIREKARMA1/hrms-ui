/** Public user payload returned by POST /auth/login (and /auth/refresh). */
export interface AuthUser {
  id: string
  email: string
  /** Legacy primary role (SUPER_ADMIN | HR_ADMIN | MANAGER | EMPLOYEE). */
  role: string
  /** Active dynamic role codes. */
  roles: string[]
  permissions: string[]
  isActive: boolean
}

/** Form values for the login mutation. `rememberMe` is client-only and not sent. */
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

/** `data` payload of POST /auth/login. */
export interface LoginResponseData {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: string
  user: AuthUser
}
