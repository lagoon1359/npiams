import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'

export interface Student {
  id: string
  user_id: string
  student_number: string
  program_id: string
  year_level: number
  enrollment_year: number
  guardian_name?: string
  guardian_phone?: string
  address?: string
  national_id?: string
  birth_certificate_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudentWithDetails extends Student {
  user: User
  program_name: string
  department_name: string
  enrolled_courses: number
  current_gpa?: number
}

export interface CreateStudentData {
  user_id: string
  student_number: string
  program_id: string
  year_level: number
  enrollment_year: number
  guardian_name?: string
  guardian_phone?: string
  address?: string
  national_id?: string
}

export class StudentService {
  static async getAllStudents(filters?: {
    program_id?: string
    year_level?: number
    is_active?: boolean
    search?: string
  }): Promise<StudentWithDetails[]> {
    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          user:users!inner (
            id,
            full_name,
            email,
            phone,
            is_active
          ),
          program:programs!inner (
            id,
            name,
            code,
            department:departments!inner (
              id,
              name,
              code
            )
          )
        `)

      if (filters?.program_id) {
        query = query.eq('program_id', filters.program_id)
      }
      if (filters?.year_level) {
        query = query.eq('year_level', filters.year_level)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters?.search) {
        query = query.or(`student_number.ilike.%${filters.search}%,user.full_name.ilike.%${filters.search}%`)
      }

      query = query.order('student_number')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch students: ${error.message}`)

      const studentsWithStats = await Promise.all(
        (data || []).map(async (student) => {
          const stats = await this.getStudentStatistics(student.id)
          return {
            ...student,
            program_name: student.program.name,
            department_name: student.program.department.name,
            ...stats
          }
        })
      )

      return studentsWithStats
    } catch (error: any) {
      console.error('Error fetching students:', error)
      throw new Error(`Failed to fetch students: ${error.message}`)
    }
  }

  static async createStudent(studentData: CreateStudentData): Promise<Student> {
    try {
      const { data: existing } = await supabase
        .from('students')
        .select('student_number')
        .eq('student_number', studentData.student_number)
        .single()

      if (existing) {
        throw new Error('Student number already exists')
      }

      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...studentData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to create student: ${error.message}`)

      console.log('Student created successfully:', data.student_number)
      return data
    } catch (error: any) {
      console.error('Error creating student:', error)
      throw new Error(`Failed to create student: ${error.message}`)
    }
  }

  static async getStudentStatistics(studentId: string) {
    try {
      const [enrollmentsResult, transcriptResult] = await Promise.all([
        supabase
          .from('student_enrollments')
          .select('id', { count: 'exact' })
          .eq('student_id', studentId)
          .eq('status', 'enrolled'),

        supabase
          .from('transcripts')
          .select('cumulative_gpa')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      ])

      return {
        enrolled_courses: enrollmentsResult.count || 0,
        current_gpa: transcriptResult.data?.cumulative_gpa || undefined
      }
    } catch (error: any) {
      console.error('Error fetching student statistics:', error)
      return {
        enrolled_courses: 0,
        current_gpa: undefined
      }
    }
  }
}
