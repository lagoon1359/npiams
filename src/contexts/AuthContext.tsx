'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // BYPASS LOGIN FOR TESTING - Set default admin user
    const setTestUser = () => {
      const testUser: User = {
        id: 'test-admin-id',
        email: 'admin@npi.edu',
        full_name: 'System Administrator',
        role: 'admin' as UserRole,
        department: 'Administration',
        phone: '+1234567890',
        address: 'NPI Campus',
        avatar_url: '/avatars/admin.jpg',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Setting test admin user for development')
      setUser(testUser)
      setLoading(false)
    }

    setTestUser()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId)

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Database error fetching user profile:', error)
        setUser(null)
        setLoading(false)
        return
      }

      if (data) {
        console.log('User profile found:', data)
        setUser(data)
      } else {
        console.log('No user profile found')
        setUser(null)
      }

    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    // BYPASS FOR TESTING - Always return success
    console.log('Login bypassed for testing')
    return {}
  }

  const signOut = async (): Promise<void> => {
    // BYPASS FOR TESTING - Do nothing
    console.log('Sign out bypassed for testing')
  }

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
