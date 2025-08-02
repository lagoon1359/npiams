import { supabase } from '@/lib/supabase'
import type { Department, User } from '@/lib/supabase'

export interface DepartmentWithDetails extends Department {
  head?: User
  total_courses: number
  total_staff: number
  total_students: number
}

export interface CreateDepartmentData {
  name: string
  code: string
  description?: string
  head_id?: string
}

export interface UpdateDepartmentData {
  name?: string
  code?: string
  description?: string
  head_id?: string
  is_active?: boolean
}

export class DepartmentService {
  /**
   * Get all departments with statistics
   */
  static async getAllDepartments(): Promise<DepartmentWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          head:users!departments_head_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (error) throw new Error(`Failed to fetch departments: ${error.message}`)

      // Get additional statistics for each department
      const departmentsWithStats = await Promise.all(
        (data || []).map(async (dept) => {
          const stats = await this.getDepartmentStatistics(dept.id)
          return {
            ...dept,
            ...stats
          }
        })
      )

      return departmentsWithStats
    } catch (error: any) {
      console.error('Error fetching departments:', error)
      throw new Error(`Failed to fetch departments: ${error.message}`)
    }
  }

  /**
   * Get department by ID with full details
   */
  static async getDepartmentById(id: string): Promise<DepartmentWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          head:users!departments_head_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`Failed to fetch department: ${error.message}`)
      }

      const stats = await this.getDepartmentStatistics(id)

      return {
        ...data,
        ...stats
      }
    } catch (error: any) {
      console.error('Error fetching department:', error)
      throw new Error(`Failed to fetch department: ${error.message}`)
    }
  }

  /**
   * Create new department
   */
  static async createDepartment(departmentData: CreateDepartmentData): Promise<Department> {
    try {
      // Check if department code already exists
      const { data: existing } = await supabase
        .from('departments')
        .select('code')
        .eq('code', departmentData.code)
        .single()

      if (existing) {
        throw new Error('Department code already exists')
      }

      const { data, error } = await supabase
        .from('departments')
        .insert([{
          ...departmentData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to create department: ${error.message}`)

      console.log('Department created successfully:', data.name)
      return data
    } catch (error: any) {
      console.error('Error creating department:', error)
      throw new Error(`Failed to create department: ${error.message}`)
    }
  }

  /**
   * Update department
   */
  static async updateDepartment(id: string, updates: UpdateDepartmentData): Promise<Department> {
    try {
      // If updating code, check for duplicates
      if (updates.code) {
        const { data: existing } = await supabase
          .from('departments')
          .select('id, code')
          .eq('code', updates.code)
          .neq('id', id)
          .single()

        if (existing) {
          throw new Error('Department code already exists')
        }
      }

      const { data, error } = await supabase
        .from('departments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Failed to update department: ${error.message}`)

      console.log('Department updated successfully:', data.name)
      return data
    } catch (error: any) {
      console.error('Error updating department:', error)
      throw new Error(`Failed to update department: ${error.message}`)
    }
  }

  /**
   * Delete department (soft delete)
   */
  static async deleteDepartment(id: string): Promise<void> {
    try {
      // Check if department has active courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('department_id', id)
        .eq('is_active', true)

      if (courses && courses.length > 0) {
        throw new Error('Cannot delete department with active courses')
      }

      const { error } = await supabase
        .from('departments')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw new Error(`Failed to delete department: ${error.message}`)

      console.log('Department deleted successfully')
    } catch (error: any) {
      console.error('Error deleting department:', error)
      throw new Error(`Failed to delete department: ${error.message}`)
    }
  }

  /**
   * Get department statistics
   */
  static async getDepartmentStatistics(departmentId: string) {
    try {
      const [coursesResult, staffResult, studentsResult] = await Promise.all([
        // Count active courses
        supabase
          .from('courses')
          .select('id', { count: 'exact' })
          .eq('department_id', departmentId)
          .eq('is_active', true),

        // Count staff members
        supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('department', departmentId)
          .in('role', ['instructor', 'tutor'])
          .eq('is_active', true),

        // Count students (through enrollments)
        supabase
          .from('enrollments')
          .select(`
            student_id,
            courses!inner (department_id)
          `, { count: 'exact' })
          .eq('courses.department_id', departmentId)
          .eq('status', 'enrolled')
      ])

      return {
        total_courses: coursesResult.count || 0,
        total_staff: staffResult.count || 0,
        total_students: studentsResult.count || 0
      }
    } catch (error: any) {
      console.error('Error fetching department statistics:', error)
      return {
        total_courses: 0,
        total_staff: 0,
        total_students: 0
      }
    }
  }

  /**
   * Get staff members for a department
   */
  static async getDepartmentStaff(departmentId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('department', departmentId)
        .in('role', ['instructor', 'tutor'])
        .eq('is_active', true)
        .order('full_name')

      if (error) throw new Error(`Failed to fetch department staff: ${error.message}`)

      return data || []
    } catch (error: any) {
      console.error('Error fetching department staff:', error)
      throw new Error(`Failed to fetch department staff: ${error.message}`)
    }
  }

  /**
   * Assign department head
   */
  static async assignDepartmentHead(departmentId: string, userId: string): Promise<void> {
    try {
      // Verify user exists and is eligible
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        throw new Error('User not found')
      }

      if (!['instructor', 'admin'].includes(user.role)) {
        throw new Error('Only instructors or admins can be department heads')
      }

      const { error } = await supabase
        .from('departments')
        .update({
          head_id: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', departmentId)

      if (error) throw new Error(`Failed to assign department head: ${error.message}`)

      console.log('Department head assigned successfully')
    } catch (error: any) {
      console.error('Error assigning department head:', error)
      throw new Error(`Failed to assign department head: ${error.message}`)
    }
  }

  /**
   * Remove department head
   */
  static async removeDepartmentHead(departmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('departments')
        .update({
          head_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', departmentId)

      if (error) throw new Error(`Failed to remove department head: ${error.message}`)

      console.log('Department head removed successfully')
    } catch (error: any) {
      console.error('Error removing department head:', error)
      throw new Error(`Failed to remove department head: ${error.message}`)
    }
  }

  /**
   * Get available users who can be department heads
   */
  static async getEligibleDepartmentHeads(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['instructor', 'admin'])
        .eq('is_active', true)
        .order('full_name')

      if (error) throw new Error(`Failed to fetch eligible users: ${error.message}`)

      return data || []
    } catch (error: any) {
      console.error('Error fetching eligible department heads:', error)
      throw new Error(`Failed to fetch eligible department heads: ${error.message}`)
    }
  }
}
