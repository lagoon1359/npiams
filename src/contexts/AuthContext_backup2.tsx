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
  const [profileFetching, setProfileFetching] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setSupabaseUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id, initialSession.user.email || '')
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state change:', event, session?.user?.email)

        setSession(session)
        setSupabaseUser(session?.user ?? null)

        if (session?.user && !profileFetching) {
          await fetchUserProfile(session.user.id, session.user.email || '')
        } else if (!session?.user) {
          setUser(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [profileFetching])

  const fetchUserProfile = async (userId: string, email: string) => {
    if (profileFetching) {
      console.log('Profile fetch already in progress, skipping...')
      return
    }

    setProfileFetching(true)

    try {
      console.log('Fetching user profile for:', email)

      // First try to fetch the user profile with a shorter timeout
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (data) {
          console.log('User profile found in database:', data)
          setUser(data)
          return
        }

        if (error && error.code === 'PGRST116') {
          // User not found - this is expected for new users
          console.log('User profile not found in database, creating new profile')
        } else if (error) {
          console.warn('Database error fetching user profile:', error.message)
        }
      } catch (dbError) {
        console.warn('Database query failed:', dbError)
      }

      // If we get here, create a basic user profile
      await createBasicUserProfile(userId, email)

    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      await createBasicUserProfile(userId, email)
    } finally {
      setProfileFetching(false)
    }
  }

  const createBasicUserProfile = async (userId: string, email: string) => {
    try {
      console.log('Creating basic user profile for:', email)

      // Determine role based on email for demo accounts
      let role: UserRole = 'student'
      let fullName = 'Demo User'

      if (email === 'admin@npi.pg') {
        role = 'admin'
        fullName = 'System Administrator'
      } else if (email === 'instructor@npi.pg') {
        role = 'instructor'
        fullName = 'Dr. John Instructor'
      } else if (email === 'student@npi.pg') {
        role = 'student'
        fullName = 'Mary Student'
      } else if (email === 'registrar@npi.pg') {
        role = 'admin'
        fullName = 'Registration Officer'
      }

      const userProfile: User = {
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Try to insert into database, but don't wait too long
      try {
        const { data, error } = await Promise.race([
          supabase
            .from('users')
            .insert(userProfile)
            .select()
            .single(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Insert timeout')), 5000)
          )
        ]) as any

        if (data && !error) {
          console.log('User profile created successfully in database:', data)
          setUser(data)
          return
        }

        if (error) {
          console.warn('Could not create user profile in database:', error.message)
        }
      } catch (insertError) {
        console.warn('Database insert failed or timed out:', insertError)
      }

      // Always set the user profile, even if database operations fail
      console.log('Using fallback user profile')
      setUser(userProfile)

    } catch (error) {
      console.error('Error creating basic user profile:', error)

      // Final fallback - create minimal user object
      const fallbackUser: User = {
        id: userId,
        email: email,
        full_name: 'Demo User',
        role: 'student',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setUser(fallbackUser)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email)
      setProfileFetching(false) // Reset any stuck state

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error.message)
        return { error: error.message }
      }

      console.log('Sign in successful for:', email)
      return {}
    } catch (error) {
      console.error('Unexpected sign in error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      console.log('Signing out...')
      setProfileFetching(false)
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    supabaseUser,
    session,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
