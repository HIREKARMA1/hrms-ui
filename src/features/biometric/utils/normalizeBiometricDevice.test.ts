import { describe, expect, it } from 'vitest'

import { normalizeBiometricDeviceList } from './normalizeBiometricDevice'
import { normalizeBiometricConnectionTest, normalizeBiometricSyncResult } from './normalizeBiometricSync'

describe('normalizeBiometricDeviceList', () => {
  it('maps items and pagination', () => {
    const result = normalizeBiometricDeviceList({
      items: [
        { id: 'd1', deviceCode: 'TW001', deviceName: 'Gate A', isActive: true },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    })
    expect(result.items[0]?.deviceCode).toBe('TW001')
    expect(result.total).toBe(1)
  })
})

describe('normalizeBiometricConnectionTest', () => {
  it('marks ok false when a step failed', () => {
    const result = normalizeBiometricConnectionTest({
      ok: false,
      steps: [{ label: 'Gateway', ok: false, detail: 'Timeout' }],
    })
    expect(result.ok).toBe(false)
    expect(result.steps[0]?.detail).toBe('Timeout')
  })

  it('maps API status pass/fail per step', () => {
    const result = normalizeBiometricConnectionTest({
      ok: false,
      steps: [
        { name: 'gateway_config', status: 'pass', detail: 'Configured' },
        { name: 'read_punches', status: 'fail', detail: 'No punches' },
      ],
    })
    expect(result.steps[0]?.ok).toBe(true)
    expect(result.steps[1]?.ok).toBe(false)
    expect(result.ok).toBe(false)
  })
})

describe('normalizeBiometricSyncResult', () => {
  it('maps per-device success boolean', () => {
    const result = normalizeBiometricSyncResult({
      ok: false,
      devices: [
        { deviceCode: '21', success: false, fetched: 0, inserted: 0 },
        { deviceCode: 'TW1KDW0010250461', success: true, fetched: 52, inserted: 2 },
      ],
    })
    expect(result.devices[0]?.ok).toBe(false)
    expect(result.devices[1]?.ok).toBe(true)
    expect(result.ok).toBe(false)
  })
})