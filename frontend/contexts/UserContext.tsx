'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi, tokenManager, UserProfile } from '@/lib/api'

interface UserContextType {
  user: UserProfile | null
  isLoading: boolean
  refreshUser: () => Promise<void>
  updateUser: (updates: Partial<UserProfile>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    const token = tokenManager.getToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const userData = await authApi.getCurrentUser(token)
      setUser(userData)
    } catch (error: any) {
      console.error('[UserContext] Failed to fetch user:', error)
      // Only remove token if it's an authentication error (401/Unauthorized)
      // Don't remove on network errors or the generic "Failed to fetch user profile" message
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        console.log('[UserContext] Auth error - removing token')
        tokenManager.removeToken()
      } else {
        console.log('[UserContext] Non-auth error - keeping token')
      }
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser: fetchUser, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
