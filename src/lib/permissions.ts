import { ROLE_LEVEL } from '@/types'
import type { UserRole } from '@/types'

export const canAccess = (
  userRole: UserRole,
  minRole: UserRole
): boolean => {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole]
}