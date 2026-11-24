export type BiometricDeviceListQuery = {
  page?: number
  limit?: number
  isActive?: boolean
  q?: string
}

export type RegisterBiometricDeviceRequest = {
  deviceCode: string
  deviceName: string
  location?: string
  isActive?: boolean
}

export type UpdateBiometricDeviceRequest = {
  deviceName?: string
  location?: string | null
  isActive?: boolean
}

export type BiometricDevice = {
  id: string
  deviceCode: string
  deviceName: string
  location?: string | null
  isActive: boolean
  lastSyncCursor?: string | null
  lastSyncedAt?: string | null
}

export type BiometricDeviceListResult = {
  items: BiometricDevice[]
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export type TimeWatchDevice = {
  deviceCode: string
  deviceName?: string
  location?: string | null
}

export type TimeWatchDeviceListResult = {
  items: TimeWatchDevice[]
}