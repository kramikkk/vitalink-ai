'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tokenManager, authApi } from '@/lib/api'

export function useAuth(requireAuth: boolean = false) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getToken()
      
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        if (requireAuth) {
          router.push('/login')
        }
        return
      }

      try {
        // Verify token by fetching user profile
        await authApi.getCurrentUser(token)
        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (error) {
        // Token is invalid or expired
        tokenManager.removeToken()
        setIsAuthenticated(false)
        setIsLoading(false)
        if (requireAuth) {
          router.push('/login')
        }
      }
    }

    checkAuth()
  }, [requireAuth, router])

  return { isAuthenticated, isLoading }
}

export function useRequireAuth() {
  return useAuth(true)
}

export function useRedirectIfAuthenticated(redirectTo: string = '/student') {
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getToken()
      
      if (!token) {
        setIsChecking(false)
        return
      }

      try {
        await authApi.getCurrentUser(token)
        // User is authenticated, redirect
        router.push(redirectTo)
      } catch (error) {
        // Token is invalid, remove it
        tokenManager.removeToken()
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  return { isChecking }
}
