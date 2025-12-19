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
    } catch (error) {
      console.error('Failed to fetch user:', error)
      tokenManager.removeToken()
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
