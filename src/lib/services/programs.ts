import { supabase } from '@/lib/supabase'
import type { Department } from '@/lib/supabase'

export interface Program {
  id: string
  name: string
  code: string
  department_id: string
  duration_years: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProgramWithDetails extends Program {
  department: Department
  total_courses: number
  total_students: number
}

export interface CreateProgramData {
  name: string
  code: string
  department_id: string
  duration_years: number
  description?: string
}

export interface UpdateProgramData {
  name?: string
  code?: string
  department_id?: string
  duration_years?: number
  description?: string
  is_active?: boolean
}

export class ProgramService {
  /**
   * Get all programs with details
   */
  static async getAllPrograms(filters?: {
    department_id?: string
    is_active?: boolean
    search?: string
  }): Promise<ProgramWithDetails[]> {
    try {
      let query = supabase
        .from('programs')
        .select(`
          *,
          department:departments!inner (
            id,
            name,
            code
          )
        `)

      if (filters?.department_id) {
        query = query.eq('department_id', filters.department_id)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
      }

      query = query.order('name')

      const { data, error } = await query

      if (error) throw new Error(`Failed to fetch programs: ${error.message}`)

      const programsWithStats = await Promise.all(
        (data || []).map(async (program) => {
          const stats = await this.getProgramStatistics(program.id)
          return {
            ...program,
            ...stats
          }
        })
      )

      return programsWithStats
    } catch (error: any) {
      console.error('Error fetching programs:', error)
      throw new Error(`Failed to fetch programs: ${error.message}`)
    }
  }

  /**
   * Get program statistics
   */
  static async getProgramStatistics(programId: string) {
    try {
      const [coursesResult, studentsResult] = await Promise.all([
        supabase
          .from('courses')
          .select('id', { count: 'exact' })
          .eq('program_id', programId)
          .eq('is_active', true),

        supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('program_id', programId)
          .eq('is_active', true)
      ])

      return {
        total_courses: coursesResult.count || 0,
        total_students: studentsResult.count || 0
      }
    } catch (error: any) {
      console.error('Error fetching program statistics:', error)
      return {
        total_courses: 0,
        total_students: 0
      }
    }
  }

  /**
   * Create new program
   */
  static async createProgram(programData: CreateProgramData): Promise<Program> {
    try {
      const { data: existing } = await supabase
        .from('programs')
        .select('code')
        .eq('code', programData.code)
        .single()

      if (existing) {
        throw new Error('Program code already exists')
      }

      const { data, error } = await supabase
        .from('programs')
        .insert([{
          ...programData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw new Error(`Failed to create program: ${error.message}`)

      console.log('Program created successfully:', data.name)
      return data
    } catch (error: any) {
      console.error('Error creating program:', error)
      throw new Error(`Failed to create program: ${error.message}`)
    }
  }
}
