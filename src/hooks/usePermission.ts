import { useAuth } from './useAuth'
import { ROLE_LEVEL } from '@/types'
import type { UserRole } from '@/types'

export function usePermission() {
  const { userRole } = useAuth()

  const can = (required: UserRole) =>
    ROLE_LEVEL[userRole] >= ROLE_LEVEL[required]

  return { can }
}