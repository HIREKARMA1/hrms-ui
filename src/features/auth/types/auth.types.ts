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
  /** Present when the auth user is linked to an Employee row. */
  employeeId?: string
}

/** Form values for the login mutation. `rememberMe` is client-only and not sent. */
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

/** `data` payload of GET /auth/me (the user is nested under `user`). */
export interface CurrentUserResponseData {
  user: AuthUser
}

/** Body of POST /auth/logout. */
export interface LogoutRequest {
  refreshToken: string
}

/** Body of POST /auth/forgot-password (the server trims and lower-cases `email`). */
export interface ForgotPasswordRequest {
  email: string
}

/**
 * Body of POST /auth/reset-password. `token` is the raw one-time token from
 * the emailed link; `newPassword` is 8 to 128 characters (server rule).
 */
export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

/** `data` payload of POST /auth/login. */
export interface LoginResponseData {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: string
  user: AuthUser
}
