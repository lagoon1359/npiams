import { supabase } from '@/lib/supabase'
import type { Course, Department, User } from '@/lib/supabase'

export interface CourseWithDetails extends Course {
  department: Department
  program: Program
  instructors: User[]
  total_students: number
  total_assessments: number
  enrollment_count: number
}

export interface Program {
  id: string
  name: string
  code: string
}

export interface CreateCourseData {
  name: string
  code: string
  description?: string
  department_id: string
  program_id: string
  year_level: number
  semester: '1' | '2'
  credit_hours: number
}

export interface UpdateCourseData {
  name?: string
  code?: string
  description?: string
  department_id?: string
  credits?: number
  instructor_id?: string
  prerequisites?: string[]
  semester?: string
  academic_year?: string
  max_students?: number
  is_active?: boolean
}

export class CourseService {
  /**
   * Get all courses with details
   */
  static async getAllCourses(filters?: {
    department_id?: string
    program_id?: string
    year_level?: number
    semester?: '1' | '2'
    is_active?: boolean
  }): Promise<CourseWithDetails[]> {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          department:departments!inner (
            id,
            name,
            code
          ),
          program:programs!inner (
            id,
            name,
            code
          )
        `)

      if (filters?.department_id) {
        query = query.eq('department_id', filters.department_id)
      }
      if (filters?.program_id) {
        query = query.eq('program_id', filters.program_id)
      }
      if (filters?.year_level) {
        query = query.eq('year_level', filters.year_level)
      }
      if (filters?.semester) {
        query = query.eq('semester', filters.semester)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch courses: ${error.message}`)

      const coursesWithStats = await Promise.all(
        (data || []).map(async (course) => {
          const [stats, instructors] = await Promise.all([
            this.getCourseStatistics(course.id),
            this.getCourseInstructors(course.id)
          ])
          return {
            ...course,
            instructors,
            ...stats
          }
        })
      )

      return coursesWithStats
    } catch (error: any) {
      console.error('Error fetching courses:', error)
      throw new Error(`Failed to fetch courses: ${error.message}`)
    }
  }

  /**
   * Create new course
   */
  static async createCourse(courseData: CreateCourseData): Promise<Course> {
    try {
      // Check if course code already exists
      const { data: existing } = await supabase
        .from('courses')
        .select('code')
        .eq('code', courseData.code)
        .single()

      if (existing) {
        throw new Error('Course code already exists')
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...courseData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to create course: ${error.message}`)

      console.log('Course created successfully:', data.name)
      return data
    } catch (error: any) {
      console.error('Error creating course:', error)
      throw new Error(`Failed to create course: ${error.message}`)
    }
  }

  /**
   * Get course instructors
   */
  static async getCourseInstructors(courseId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('course_instructors')
        .select(`
          instructor:users!inner (
            id,
            full_name,
            email,
            role
          )
        `)
        .eq('course_id', courseId)

      if (error) throw new Error(`Failed to fetch course instructors: ${error.message}`)

      return data?.map(item => item.instructor) || []
    } catch (error: any) {
      console.error('Error fetching course instructors:', error)
      return []
    }
  }

  /**
   * Get course statistics
   */
  static async getCourseStatistics(courseId: string) {
    try {
      const [studentsResult, assessmentsResult, enrollmentsResult] = await Promise.all([
        // Count enrolled students
        supabase
          .from('student_enrollments')
          .select('id', { count: 'exact' })
          .eq('course_id', courseId)
          .eq('status', 'enrolled'),

        // Count assessment definitions
        supabase
          .from('assessment_definitions')
          .select('id', { count: 'exact' })
          .eq('course_id', courseId),

        // Count total enrollments
        supabase
          .from('student_enrollments')
          .select('id', { count: 'exact' })
          .eq('course_id', courseId)
      ])

      return {
        total_students: studentsResult.count || 0,
        total_assessments: assessmentsResult.count || 0,
        enrollment_count: enrollmentsResult.count || 0
      }
    } catch (error: any) {
      console.error('Error fetching course statistics:', error)
      return {
        total_students: 0,
        total_assessments: 0,
        enrollment_count: 0
      }
    }
  }

  /**
   * Get available instructors for assignment
   */
  static async getAvailableInstructors(departmentId?: string): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .in('role', ['instructor', 'admin'])
        .eq('is_active', true)

      if (departmentId) {
        query = query.eq('department', departmentId)
      }

      query = query.order('full_name')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch instructors: ${error.message}`)

      return data || []
    } catch (error: any) {
      console.error('Error fetching available instructors:', error)
      throw new Error(`Failed to fetch available instructors: ${error.message}`)
    }
  }
}
