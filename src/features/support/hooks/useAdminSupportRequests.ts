import { useSyncExternalStore } from 'react'

import {
  getAdminSupportStoreSnapshot,
  subscribeAdminSupportStore,
} from '../services/adminSupportStore'

export function useAdminSupportRequests() {
  return useSyncExternalStore(
    subscribeAdminSupportStore,
    getAdminSupportStoreSnapshot,
    getAdminSupportStoreSnapshot,
  )
}