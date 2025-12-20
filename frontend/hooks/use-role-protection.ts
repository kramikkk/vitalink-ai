'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tokenManager, UserRole } from '@/lib/api'

export function useRoleProtection(allowedRoles: UserRole[]) {
  const router = useRouter()

  useEffect(() => {
    const token = tokenManager.getToken()
    const role = tokenManager.getRole()

    if (!token || !role) {
      router.push('/login')
      return
    }

    if (!allowedRoles.includes(role)) {
      // Redirect based on current role
      if (role === UserRole.STUDENT) {
        router.push('/student')
      } else if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
        router.push('/admin')
      } else {
        router.push('/login')
      }
    }
  }, [router, allowedRoles])
}

export function useAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    const token = tokenManager.getToken()
    const role = tokenManager.getRole()

    if (!token || !role) {
      router.push('/login')
      return
    }
  }, [router])
}
