import { useContext } from 'react'

import { RbacContext } from '../context/rbacContext'

export function useRbacSession() {
  const context = useContext(RbacContext)
  if (!context) {
    throw new Error('useRbacSession must be used within RbacProvider')
  }
  return context
}

export function useOptionalRbacSession() {
  return useContext(RbacContext)
}
