"use client"

import React from 'react'
import { apiFetch, clearToken, getToken, setToken } from '@/lib/api'

type User = { _id: string; name: string; email: string }

type AuthContextValue = {
  user: User | null
  token: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [token, setTok] = React.useState<string | null>(null)

  React.useEffect(() => {
    const t = typeof window !== 'undefined' ? getToken() : null
    if (t) {
      setTok(t)
      ;(async () => {
        try {
          const me = await apiFetch<User>('/auth/me')
          setUser(me)
        } catch {
          clearToken()
          setTok(null)
        }
      })()
    }
  }, [])

  const refreshMe = React.useCallback(async () => {
    try {
      const me = await apiFetch<User>('/auth/me')
      setUser(me)
    } catch {
      // ignore
    }
  }, [])

  const login = React.useCallback(async (email: string, password: string, remember = true) => {
    const res = await apiFetch<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(res.accessToken, remember)
    setTok(res.accessToken)
    setUser(res.user)
  }, [])

  const register = React.useCallback(async (name: string, email: string, password: string) => {
    const res = await apiFetch<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    setToken(res.accessToken)
    setTok(res.accessToken)
    setUser(res.user)
  }, [])

  const logout = React.useCallback(() => {
    clearToken()
    setUser(null)
    setTok(null)
  }, [])

  const value = React.useMemo<AuthContextValue>(() => ({ user, token, login, register, logout, refreshMe }), [user, token, login, register, logout, refreshMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
