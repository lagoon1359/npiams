import { supabase } from '@/lib/supabase'

export interface AcademicYear {
  id: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export class AcademicYearService {
  static async getAllAcademicYears(): Promise<AcademicYear[]> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw new Error(`Failed to fetch academic years: ${error.message}`)
      return data || []
    } catch (error: any) {
      console.error('Error fetching academic years:', error)
      throw new Error(`Failed to fetch academic years: ${error.message}`)
    }
  }

  static async getCurrentAcademicYear(): Promise<AcademicYear | null> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_current', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`Failed to fetch current academic year: ${error.message}`)
      }

      return data
    } catch (error: any) {
      console.error('Error fetching current academic year:', error)
      return null
    }
  }
}
