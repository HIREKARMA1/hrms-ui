import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { authApi } from '@/features/auth/api/authApi'
import { authReducer } from '@/features/auth/store/authSlice'
import { formatInr } from '@/features/employees/utils/format'
import { hasAccrualRun, recordAccrualRun } from '@/features/leave/services/leaveService'
import { resetLeaveStore } from '@/features/leave/services/mockLeaveStore'

import { baseApi } from './baseApi'
import { getApiErrorMessage } from './errors'
import { MAX_UPLOAD_BYTES, UPLOAD_FOLDER_PATTERN, uploadsApi } from './uploadsApi'

/** Isolated store: same reducer + middleware wiring as the app store, no persistence. */
function makeStore(accessToken: string | null = 'access-1') {
  return configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    preloadedState: {
      auth: { accessToken, refreshToken: accessToken ? 'refresh-1' : null, user: null, rememberMe: false },
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  })
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

/** Every request goes to this stub; nothing reaches the network. */
function stubFetch(handler: (request: Request) => Response | Promise<Response>) {
  const calls: Request[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      calls.push(request.clone())
      return handler(request)
    }),
  )
  return calls
}

const ASSET = {
  key: 'employees/photos/abc.png',
  assetUrl: 'https://cdn.example.test/employees/photos/abc.png',
  folder: 'employees/photos',
  originalName: 'me.png',
  contentType: 'image/png',
  size: 3,
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('uploadsApi (verified contract: POST /uploads)', () => {
  it('sends multipart file + folder with the Bearer token and unwraps data', async () => {
    const calls = stubFetch(() => jsonResponse(201, { success: true, message: 'File uploaded', data: ASSET }))
    const store = makeStore('access-1')

    const result = await store
      .dispatch(
        uploadsApi.endpoints.uploadFile.initiate({
          file: new Blob(['abc'], { type: 'image/png' }),
          fileName: 'me.png',
          folder: 'employees/photos',
        }),
      )
      .unwrap()

    expect(result).toEqual(ASSET)
    expect(calls).toHaveLength(1)
    const request = calls[0]
    expect(request.method).toBe('POST')
    expect(new URL(request.url).pathname.endsWith('/uploads')).toBe(true)
    expect(request.headers.get('Authorization')).toBe('Bearer access-1')
    // fetch must set the multipart boundary itself; never forced to JSON.
    expect(request.headers.get('Content-Type') ?? '').toMatch(/^multipart\/form-data; boundary=/)
    const form = await request.formData()
    expect(form.get('folder')).toBe('employees/photos')
    const file = form.get('file')
    expect(file).toBeInstanceOf(Blob)
    expect((file as File).name).toBe('me.png')
  })

  it('surfaces the Nest error message on 400', async () => {
    stubFetch(() => jsonResponse(400, { statusCode: 400, message: 'file is required', error: 'Bad Request' }))
    const store = makeStore()
    const outcome = await store.dispatch(
      uploadsApi.endpoints.uploadFile.initiate({ file: new Blob([]), fileName: 'x.png', folder: 'employees/photos' }),
    )
    expect('error' in outcome).toBe(true)
    expect(getApiErrorMessage((outcome as { error: unknown }).error)).toBe('file is required')
  })

  it('mirrors the server folder rule and size limit', () => {
    expect(UPLOAD_FOLDER_PATTERN.test('employees/photos')).toBe(true)
    expect(UPLOAD_FOLDER_PATTERN.test('a/b/c')).toBe(true)
    expect(UPLOAD_FOLDER_PATTERN.test('a/b/c/d')).toBe(false)
    expect(UPLOAD_FOLDER_PATTERN.test('/employees')).toBe(false)
    expect(UPLOAD_FOLDER_PATTERN.test('../etc')).toBe(false)
    expect(MAX_UPLOAD_BYTES).toBe(10 * 1024 * 1024)
  })
})

describe('uploadEmployeeProfilePhoto', () => {
  async function loadHelper(enabled: string | undefined) {
    // Explicitly clear when undefined so a previous stubEnv('true') cannot leak.
    vi.stubEnv('VITE_EMPLOYEE_PHOTO_UPLOAD_ENABLED', enabled ?? '')
    vi.resetModules()
    return import('@/features/employees/services/employeeApi')
  }
  const input = { employeeId: 'EMP-1', file: new Blob(['abc']), fileName: 'me.png' }

  it('is off by default: returns missing_api and never calls the server', async () => {
    const { uploadEmployeeProfilePhoto, isEmployeePhotoUploadConfigured } = await loadHelper(undefined)
    const upload = vi.fn()
    const result = await uploadEmployeeProfilePhoto(input, upload)
    expect(isEmployeePhotoUploadConfigured()).toBe(false)
    expect(result).toMatchObject({ ok: false, code: 'missing_api' })
    expect(upload).not.toHaveBeenCalled()
  })

  it('only the exact flag value `true` enables it', async () => {
    const { isEmployeePhotoUploadConfigured } = await loadHelper('yes')
    expect(isEmployeePhotoUploadConfigured()).toBe(false)
  })

  it('when enabled, uploads to the employees/photos folder and returns the asset URL', async () => {
    const { uploadEmployeeProfilePhoto, EMPLOYEE_PHOTO_FOLDER } = await loadHelper('true')
    const upload = vi.fn().mockResolvedValue(ASSET)
    const result = await uploadEmployeeProfilePhoto(input, upload)
    expect(upload).toHaveBeenCalledWith({ file: input.file, fileName: 'me.png', folder: EMPLOYEE_PHOTO_FOLDER })
    expect(UPLOAD_FOLDER_PATTERN.test(EMPLOYEE_PHOTO_FOLDER)).toBe(true)
    expect(result).toEqual({ ok: true, url: ASSET.assetUrl, fileName: 'me.png' })
  })

  it('maps network and HTTP errors without claiming success', async () => {
    const { uploadEmployeeProfilePhoto } = await loadHelper('true')
    const network = await uploadEmployeeProfilePhoto(input, vi.fn().mockRejectedValue({ status: 'FETCH_ERROR', error: 'x' }))
    expect(network).toMatchObject({ ok: false, code: 'network' })
    const http = await uploadEmployeeProfilePhoto(
      input,
      vi.fn().mockRejectedValue({ status: 503, data: { message: 'Upload failed: S3 down' } }),
    )
    expect(http).toEqual({ ok: false, code: 'http', message: 'Upload failed: S3 down' })
    const noUrl = await uploadEmployeeProfilePhoto(input, vi.fn().mockResolvedValue({ ...ASSET, assetUrl: '' }))
    expect(noUrl).toMatchObject({ ok: false, code: 'http' })
  })

  it('allows upload without employee id (registration) and rejects oversized files', async () => {
    const { uploadEmployeeProfilePhoto } = await loadHelper('true')
    const upload = vi.fn().mockResolvedValue(ASSET)
    expect(
      await uploadEmployeeProfilePhoto({ employeeId: ' ', file: input.file, fileName: 'me.png' }, upload),
    ).toMatchObject({ ok: true })
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'employees/photos', fileName: 'me.png' }),
    )
    const big = { size: MAX_UPLOAD_BYTES + 1 } as Blob
    expect(
      await uploadEmployeeProfilePhoto({ ...input, file: big }, vi.fn()),
    ).toMatchObject({ code: 'invalid' })
  })
})

describe('authApi (verified contract regression)', () => {
  it('POST /auth/login sends only email + password (rememberMe is client-only)', async () => {
    const calls = stubFetch(() =>
      jsonResponse(200, {
        success: true,
        message: 'ok',
        data: {
          accessToken: 'a',
          refreshToken: 'r',
          tokenType: 'Bearer',
          expiresIn: '15m',
          user: { id: 'u', email: 'a@b.test', role: 'EMPLOYEE', roles: ['EMPLOYEE'], permissions: [], isActive: true },
        },
      }),
    )
    const store = makeStore(null)
    const data = await store
      .dispatch(authApi.endpoints.login.initiate({ email: 'a@b.test', password: 'pw', rememberMe: true }))
      .unwrap()
    expect(data.accessToken).toBe('a')
    expect(new URL(calls[0].url).pathname.endsWith('/auth/login')).toBe(true)
    expect(await calls[0].json()).toEqual({ email: 'a@b.test', password: 'pw' })
  })

  it('GET /auth/me unwraps data.user', async () => {
    const user = { id: 'u1', email: 'e@x.test', role: 'EMPLOYEE', roles: ['EMPLOYEE'], permissions: [], isActive: true }
    stubFetch(() => jsonResponse(200, { success: true, message: 'ok', data: { user } }))
    const store = makeStore('access-1')
    const result = await store.dispatch(authApi.endpoints.getCurrentUser.initiate())
    expect(result.data).toEqual(user)
  })
})

describe('leave service facade (accrual run bookkeeping)', () => {
  it('records a run once and reports it', () => {
    resetLeaveStore()
    expect(hasAccrualRun('2099-01')).toBe(false)
    recordAccrualRun('2099-01')
    recordAccrualRun('2099-01')
    expect(hasAccrualRun('2099-01')).toBe(true)
    expect(hasAccrualRun('2099-02')).toBe(false)
  })
})

describe('formatInr (moved out of the mock module)', () => {
  it('formats rupees without decimals', () => {
    expect(formatInr(1250000)).toBe('₹12,50,000')
  })
})
