import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/lib/supabase'

export interface UserWithDetails extends User {
  department_name?: string
  assigned_courses?: number
  active_students?: number
}

export interface CreateUserData {
  email: string
  full_name: string
  role: UserRole
  department?: string
  phone?: string
  date_of_birth?: string
  is_active?: boolean
}

export interface UpdateUserData {
  full_name?: string
  role?: UserRole
  department?: string
  phone?: string
  date_of_birth?: string
  is_active?: boolean
}

export class UserService {
  /**
   * Get all users with details and filters
   */
  static async getAllUsers(filters?: {
    role?: UserRole
    department?: string
    is_active?: boolean
    search?: string
  }): Promise<UserWithDetails[]> {
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          department:departments!users_department_fkey (
            id,
            name,
            code
          )
        `)

      // Apply filters
      if (filters?.role) {
        query = query.eq('role', filters.role)
      }
      if (filters?.department) {
        query = query.eq('department', filters.department)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      query = query.order('full_name')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch users: ${error.message}`)

      // Get additional statistics for instructors
      const usersWithStats = await Promise.all(
        (data || []).map(async (user) => {
          if (user.role === 'instructor' || user.role === 'tutor') {
            const stats = await this.getUserStatistics(user.id)
            return {
              ...user,
              department_name: user.department?.name,
              ...stats
            }
          }
          return {
            ...user,
            department_name: user.department?.name,
            assigned_courses: 0,
            active_students: 0
          }
        })
      )

      return usersWithStats
    } catch (error: any) {
      console.error('Error fetching users:', error)
      throw new Error(`Failed to fetch users: ${error.message}`)
    }
  }

  /**
   * Get user by ID with full details
   */
  static async getUserById(id: string): Promise<UserWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          department:departments!users_department_fkey (
            id,
            name,
            code
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`Failed to fetch user: ${error.message}`)
      }

      const stats = await this.getUserStatistics(id)

      return {
        ...data,
        department_name: data.department?.name,
        ...stats
      }
    } catch (error: any) {
      console.error('Error fetching user:', error)
      throw new Error(`Failed to fetch user: ${error.message}`)
    }
  }

  /**
   * Create new user
   */
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single()

      if (existing) {
        throw new Error('Email already exists')
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          is_active: userData.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to create user: ${error.message}`)

      console.log('User created successfully:', data.full_name)
      return data
    } catch (error: any) {
      console.error('Error creating user:', error)
      throw new Error(`Failed to create user: ${error.message}`)
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, updates: UpdateUserData): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update user: ${error.message}`)

      console.log('User updated successfully:', data.full_name)
      return data
    } catch (error: any) {
      console.error('Error updating user:', error)
      throw new Error(`Failed to update user: ${error.message}`)
    }
  }

  /**
   * Activate/Deactivate user
   */
  static async toggleUserStatus(id: string, is_active: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw new Error(`Failed to update user status: ${error.message}`)

      console.log(`User ${is_active ? 'activated' : 'deactivated'} successfully`)
    } catch (error: any) {
      console.error('Error updating user status:', error)
      throw new Error(`Failed to update user status: ${error.message}`)
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      // Check if user has any active relationships
      const [coursesResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('course_instructors')
          .select('id')
          .eq('instructor_id', id),

        supabase
          .from('students')
          .select('id')
          .eq('user_id', id)
          .eq('is_active', true)
      ])

      if (coursesResult.data && coursesResult.data.length > 0) {
        throw new Error('Cannot delete user with active course assignments')
      }

      if (enrollmentsResult.data && enrollmentsResult.data.length > 0) {
        throw new Error('Cannot delete user with active student record')
      }

      const { error } = await supabase
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw new Error(`Failed to delete user: ${error.message}`)

      console.log('User deleted successfully')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Get user statistics (for instructors)
   */
  static async getUserStatistics(userId: string) {
    try {
      const [coursesResult, studentsResult] = await Promise.all([
        // Count assigned courses
        supabase
          .from('course_instructors')
          .select('id', { count: 'exact' })
          .eq('instructor_id', userId),

        // Count active students in assigned courses
        supabase
          .from('student_enrollments')
          .select(`
            id,
            course_id,
            course_instructors!inner (instructor_id)
          `, { count: 'exact' })
          .eq('course_instructors.instructor_id', userId)
          .eq('status', 'enrolled')
      ])

      return {
        assigned_courses: coursesResult.count || 0,
        active_students: studentsResult.count || 0
      }
    } catch (error: any) {
      console.error('Error fetching user statistics:', error)
      return {
        assigned_courses: 0,
        active_students: 0
      }
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole, department?: string): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)

      if (department) {
        query = query.eq('department', department)
      }

      query = query.order('full_name')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch users by role: ${error.message}`)

      return data || []
    } catch (error: any) {
      console.error('Error fetching users by role:', error)
      throw new Error(`Failed to fetch users by role: ${error.message}`)
    }
  }

  /**
   * Get user roles statistics
   */
  static async getUserRoleStatistics() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('is_active', true)

      if (error) throw new Error(`Failed to fetch role statistics: ${error.message}`)

      const stats = {
        admin: 0,
        department_head: 0,
        instructor: 0,
        tutor: 0,
        student: 0,
        total: data?.length || 0
      }

      data?.forEach(user => {
        if (user.role in stats) {
          stats[user.role as keyof typeof stats]++
        }
      })

      return stats
    } catch (error: any) {
      console.error('Error fetching role statistics:', error)
      return {
        admin: 0,
        department_head: 0,
        instructor: 0,
        tutor: 0,
        student: 0,
        total: 0
      }
    }
  }

  /**
   * Bulk import users
   */
  static async bulkImportUsers(users: CreateUserData[]): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] }

    for (const userData of users) {
      try {
        await this.createUser(userData)
        results.success++
      } catch (error: any) {
        results.errors.push(`${userData.email}: ${error.message}`)
      }
    }

    return results
  }
}
