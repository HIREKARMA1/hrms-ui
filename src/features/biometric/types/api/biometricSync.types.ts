export type BiometricSyncRequest = {
  deviceCode?: string
}

export type BiometricDeviceSyncResult = {
  deviceCode: string
  ok: boolean
  fetched?: number
  inserted?: number
  skipped?: number
  message?: string
  lastSyncCursor?: string | null
}

export type BiometricSyncResult = {
  ok: boolean
  devices: BiometricDeviceSyncResult[]
}

export type BiometricConnectionTestStep = {
  id: string
  label: string
  ok: boolean
  detail?: string
}

export type BiometricConnectionTestResult = {
  ok: boolean
  steps: BiometricConnectionTestStep[]
  timewatchDevices?: string[]
  registeredDevices?: string[]
  sample?: unknown
}