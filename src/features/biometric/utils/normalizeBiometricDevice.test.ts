import { describe, expect, it } from 'vitest'

import { normalizeBiometricDeviceList } from './normalizeBiometricDevice'
import { normalizeBiometricConnectionTest } from './normalizeBiometricSync'

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
})