import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Supabase configuration with robust build-time fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Only log warnings in development, not during build
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'
const isBuildTime = typeof window === 'undefined' && process.env.VERCEL_ENV === undefined

// Check for real credentials only in production runtime (not build time)
if (isProduction && typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Production environment missing Supabase configuration')
}

// Client-side Supabase client with error handling
let supabase: any

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
} catch (error) {
  // Fallback client for build time
  supabase = {
    auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }) },
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }) })
  }
}

export { supabase }

// Client component Supabase client with error handling
export const createSupabaseClient = () => {
  try {
    return createClientComponentClient()
  } catch (error) {
    // Return the main client as fallback
    return supabase
  }
}

// Type definitions
export type UserRole = 'admin' | 'department_head' | 'instructor' | 'tutor' | 'student'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  department?: string
  phone?: string
  address?: string
  avatar_url?: string
  date_of_birth?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  head_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  name: string
  code: string
  description?: string
  department_id: string
  program_id: string
  year_level: number
  semester: '1' | '2'
  credit_hours: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Extended types for application use
export interface UserWithDetails extends Omit<User, 'department'> {
  department?: Department
}

export interface DepartmentWithStats extends Department {
  total_instructors: number
  total_students: number
  total_courses: number
  head?: User
}

export interface CourseWithDetails extends Course {
  department: Department
  instructor?: User
  student_count: number
}
