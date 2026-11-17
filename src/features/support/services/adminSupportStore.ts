import { SEED_ADMIN_SUPPORT_REQUESTS } from '../mocks/seedAdminRequests'
import type {
  AdminSupportRequest,
  CreateAdminSupportRequestInput,
} from '../types/adminSupportRequest'

const STORAGE_KEY = 'hrms.adminSupportRequests.v1'

type StoreSnapshot = AdminSupportRequest[]

let cache: StoreSnapshot | null = null
const listeners = new Set<() => void>()

function readStorage(): StoreSnapshot {
  if (typeof window === 'undefined') {
    return [...SEED_ADMIN_SUPPORT_REQUESTS]
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(SEED_ADMIN_SUPPORT_REQUESTS),
      )
      return [...SEED_ADMIN_SUPPORT_REQUESTS]
    }
    const parsed = JSON.parse(raw) as AdminSupportRequest[]
    return Array.isArray(parsed) ? parsed : [...SEED_ADMIN_SUPPORT_REQUESTS]
  } catch {
    return [...SEED_ADMIN_SUPPORT_REQUESTS]
  }
}

function writeStorage(requests: StoreSnapshot) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

function getSnapshot(): StoreSnapshot {
  if (cache === null) {
    cache = readStorage()
  }
  return cache
}

function setSnapshot(requests: StoreSnapshot) {
  cache = requests
  writeStorage(requests)
  listeners.forEach((listener) => listener())
}

export function subscribeAdminSupportStore(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAdminSupportStoreSnapshot(): StoreSnapshot {
  return getSnapshot()
}

function nextRequestId(requests: AdminSupportRequest[]): string {
  const maxNum = requests.reduce((max, item) => {
    const match = /^REQ-(\d+)$/.exec(item.id)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 1000)
  return `REQ-${maxNum + 1}`
}

export function createAdminSupportRequest(
  input: CreateAdminSupportRequestInput,
): AdminSupportRequest {
  const requests = getSnapshot()
  const request: AdminSupportRequest = {
    id: nextRequestId(requests),
    email: input.email.trim(),
    employeeId: input.employeeId?.trim() || undefined,
    issues: input.issues,
    otherDetail: input.otherDetail?.trim() || undefined,
    note: input.note?.trim() || undefined,
    status: 'open',
    createdAt: new Date().toISOString(),
    replies: [],
  }
  setSnapshot([request, ...requests])
  return request
}

export function replyToAdminSupportRequest(
  requestId: string,
  message: string,
  sentBy = 'HR Support',
): AdminSupportRequest | null {
  const trimmed = message.trim()
  if (!trimmed) return null

  const requests = getSnapshot()
  const index = requests.findIndex((item) => item.id === requestId)
  if (index === -1) return null

  const current = requests[index]
  const reply = {
    id: `r-${Date.now()}`,
    message: trimmed,
    sentAt: new Date().toISOString(),
    sentBy,
  }
  const updated: AdminSupportRequest = {
    ...current,
    status: current.status === 'closed' ? 'closed' : 'replied',
    replies: [...current.replies, reply],
  }
  const next = [...requests]
  next[index] = updated
  setSnapshot(next)
  return updated
}

export function closeAdminSupportRequest(
  requestId: string,
): AdminSupportRequest | null {
  const requests = getSnapshot()
  const index = requests.findIndex((item) => item.id === requestId)
  if (index === -1) return null
  const updated = { ...requests[index], status: 'closed' as const }
  const next = [...requests]
  next[index] = updated
  setSnapshot(next)
  return updated
}

export function deleteAdminSupportRequest(requestId: string): boolean {
  const requests = getSnapshot()
  const next = requests.filter((item) => item.id !== requestId)
  if (next.length === requests.length) return false
  setSnapshot(next)
  return true
}