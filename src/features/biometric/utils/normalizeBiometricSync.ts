import type {
  BiometricConnectionTestResult,
  BiometricConnectionTestStep,
  BiometricDeviceSyncResult,
  BiometricSyncResult,
} from '../types/api/biometricSync.types'
import { coerceBoolean, coerceNumber, coerceOptionalString, pickItemsArray, unwrapRecord } from './biometricApiCoerce'

function biometricRowOk(o: Record<string, unknown>): boolean {
  if (typeof o.ok === 'boolean') return o.ok
  if (typeof o.passed === 'boolean') return o.passed
  if (typeof o.success === 'boolean') return o.success
  const status = coerceOptionalString(o.status)?.toLowerCase()
  if (status === 'pass' || status === 'passed' || status === 'success' || status === 'ok') return true
  if (status === 'fail' || status === 'failed' || status === 'error') return false
  return coerceBoolean(o.ok ?? o.passed ?? o.success, false)
}

function mapStep(raw: unknown, index: number): BiometricConnectionTestStep {
  const o = unwrapRecord(raw)
  const label = coerceOptionalString(o.label ?? o.name ?? o.step) ?? `Step ${index + 1}`
  return {
    id: coerceOptionalString(o.id ?? o.key ?? o.name) ?? String(index),
    label,
    ok: biometricRowOk(o),
    detail: coerceOptionalString(o.detail ?? o.message),
  }
}

export function normalizeBiometricConnectionTest(raw: unknown): BiometricConnectionTestResult {
  const root = unwrapRecord(raw)
  const steps = (Array.isArray(root.steps) ? root.steps : []).map(mapStep)
  const ok = coerceBoolean(root.ok, steps.length > 0 && steps.every((step) => step.ok))
  return {
    ok,
    steps,
    timewatchDevices: Array.isArray(root.timewatchDevices)
      ? root.timewatchDevices.map(String)
      : undefined,
    registeredDevices: Array.isArray(root.registeredDevices)
      ? root.registeredDevices.map(String)
      : undefined,
    sample: root.sample,
  }
}

function mapDeviceSync(raw: unknown): BiometricDeviceSyncResult {
  const o = unwrapRecord(raw)
  const deviceCode = coerceOptionalString(o.deviceCode) ?? 'unknown'
  return {
    deviceCode,
    ok: biometricRowOk(o),
    fetched: coerceNumber(o.fetched),
    inserted: coerceNumber(o.inserted),
    skipped: coerceNumber(o.skipped),
    message: coerceOptionalString(o.message ?? o.error),
    lastSyncCursor: coerceOptionalString(o.lastSyncCursor) ?? null,
  }
}

export function normalizeBiometricSyncResult(raw: unknown): BiometricSyncResult {
  const root = unwrapRecord(raw)
  const devices = pickItemsArray(root.devices ?? root.results ?? raw).map(mapDeviceSync)
  const ok = coerceBoolean(root.ok ?? root.success, devices.length === 0 ? true : devices.every((d) => d.ok))
  return { ok, devices }
}