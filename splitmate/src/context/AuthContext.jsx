import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as storage from '../data/storage.js'

// All auth logic lives here. Pages use useAuth() and never touch sessions
// or passwords themselves. Passwords are plain text: local testing only.

const AuthContext = createContext(null)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await storage.ensureSeeded()
      const userId = await storage.getSessionUserId()
      const sessionUser = userId ? await storage.getUserById(userId) : null
      if (userId && !sessionUser) await storage.clearSession()
      if (!cancelled) {
        setUser(sessionUser)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const record = await storage.getUserRecordByEmail(email)
    if (!record || record.password !== password) {
      throw new Error('Incorrect email or password')
    }
    await storage.setSessionUserId(record.id)
    const loggedIn = await storage.getUserById(record.id)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const register = useCallback(async (name, email, password) => {
    if (!name.trim()) throw new Error('Please enter your name')
    if (!EMAIL_RE.test(email.trim())) throw new Error('Please enter a valid email')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')
    const created = await storage.createUser({ name, email, password })
    await storage.setSessionUserId(created.id)
    setUser(created)
    return created
  }, [])

  const logout = useCallback(async () => {
    await storage.clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
