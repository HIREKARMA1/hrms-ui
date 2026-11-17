import { useContext } from 'react'

import { RecruitmentContext } from '../context/recruitmentContext'

export function useRecruitment() {
  const ctx = useContext(RecruitmentContext)
  if (!ctx) {
    throw new Error('useRecruitment must be used within RecruitmentProvider')
  }
  return ctx
}