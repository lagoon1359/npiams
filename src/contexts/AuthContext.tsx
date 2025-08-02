'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User, UserRole } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch user profile from our users table
  const fetchUserProfile = async (email: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          department:departments (
            id,
            name,
            code
          )
        `)
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      return null
    }
  }

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true)

        if (session?.user) {
          setSupabaseUser(session.user)

          // Fetch the user profile from our users table
          const userProfile = await fetchUserProfile(session.user.email!)

          if (userProfile) {
            setUser(userProfile)
          } else {
            // User exists in auth but not in our users table
            console.warn('User authenticated but no profile found in users table')
            setUser(null)
            await supabase.auth.signOut()
          }
        } else {
          setSupabaseUser(null)
          setUser(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Fetch user profile
        const userProfile = await fetchUserProfile(email)

        if (!userProfile) {
          await supabase.auth.signOut()
          return { success: false, error: 'User profile not found or account is inactive' }
        }

        setUser(userProfile)
        setSupabaseUser(data.user)

        // Redirect based on role
        redirectAfterLogin(userProfile.role)

        return { success: true }
      }

      return { success: false, error: 'Authentication failed' }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign up function (for admin use)
  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true)

      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (authData.user) {
        // Create user profile in our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: authData.user.email!,
            full_name: userData.full_name || '',
            role: userData.role || 'student',
            phone: userData.phone,
            date_of_birth: userData.date_of_birth,
            department: userData.department,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (profileError) {
          // If profile creation fails, delete the auth user
          await supabase.auth.admin.deleteUser(authData.user.id)
          return { success: false, error: `Failed to create user profile: ${profileError.message}` }
        }

        return { success: true }
      }

      return { success: false, error: 'Failed to create account' }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
      router.push('/login')
    } catch (error: any) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' }
      }

      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Refresh user data
      const updatedProfile = await fetchUserProfile(user.email)
      if (updatedProfile) {
        setUser(updatedProfile)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Redirect after login based on role
  const redirectAfterLogin = (role: UserRole) => {
    switch (role) {
      case 'admin':
        // Check if system setup is needed
        router.push('/system-setup')
        break
      case 'department_head':
        // Department heads also need access to system setup
        router.push('/system-setup')
        break
      case 'instructor':
        router.push('/courses')
        break
      case 'tutor':
        router.push('/courses')
        break
      case 'student':
        router.push('/dashboard')
        break
      default:
        router.push('/dashboard')
    }
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword
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

// Higher-order component for route protection
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  allowedRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login')
          return
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.push('/unauthorized')
          return
        }
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return null
    }

    return <Component {...props} />
  }
}

// Hook for role-based access control
export function useRoleAccess(requiredRoles: UserRole[]) {
  const { user } = useAuth()

  return {
    hasAccess: user ? requiredRoles.includes(user.role) : false,
    user,
    isAdmin: user?.role === 'admin',
    isDepartmentHead: user?.role === 'department_head',
    isInstructor: user?.role === 'instructor',
    isTutor: user?.role === 'tutor',
    isStudent: user?.role === 'student'
  }
}
