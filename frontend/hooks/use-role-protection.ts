'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tokenManager, UserRole, authApi } from '@/lib/api'

export function useRoleProtection(allowedRoles: UserRole[]) {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyRole = async () => {
      const token = tokenManager.getToken()

      if (!token) {
        router.push('/login')
        return
      }

      try {
        // Verify token and get ACTUAL role from backend
        const user = await authApi.getCurrentUser(token)

        // Validate backend role matches allowed roles
        if (!allowedRoles.includes(user.role as UserRole)) {
          // Redirect based on actual backend role
          if (user.role === 'student') {
            router.push('/student')
          } else if (user.role === 'admin' || user.role === 'super_admin') {
            router.push('/admin')
          } else {
            router.push('/login')
          }
        } else {
          // Role is valid, update localStorage to match backend
          tokenManager.setRole(user.role as UserRole)
        }
      } catch (error: any) {
        console.error('[RoleProtection] Error:', error)
        // Only logout on authentication errors (401), not network errors
        if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
          tokenManager.logout()
          router.push('/login')
        }
        // For network errors, stay logged in - user will see offline state
      } finally {
        setIsVerifying(false)
      }
    }

    verifyRole()
  }, [router, allowedRoles])

  return { isVerifying }
}

export function useAuthRedirect() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      const token = tokenManager.getToken()

      if (!token) {
        router.push('/login')
        return
      }

      try {
        // Verify token is still valid
        await authApi.getCurrentUser(token)

        // Check if token needs refresh
        if (tokenManager.isTokenExpiringSoon()) {
          await tokenManager.refreshToken()
        }
      } catch (error: any) {
        console.error('[AuthRedirect] Error:', error)
        // Only logout on authentication errors (401), not network errors
        if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
          tokenManager.logout()
          router.push('/login')
        }
      } finally {
        setIsVerifying(false)
      }
    }

    verifyAuth()

    // Set up automatic token refresh every 50 minutes (for 60-minute tokens)
    const refreshInterval = setInterval(async () => {
      if (tokenManager.isTokenExpiringSoon()) {
        const refreshed = await tokenManager.refreshToken()
        if (!refreshed) {
          tokenManager.logout()
          router.push('/login')
        }
      }
    }, 50 * 60 * 1000) // 50 minutes

    return () => clearInterval(refreshInterval)
  }, [router])

  return { isVerifying }
}
