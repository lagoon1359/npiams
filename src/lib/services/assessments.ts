import { supabase } from '@/lib/supabase'
import { createSupabaseClient } from '@/lib/supabase'

// Assessment types and interfaces
export interface Assessment {
  id: string
  course_id: string
  semester_id: string
  name: string
  type: 'assignment' | 'midterm' | 'practical' | 'final' | 'project' | 'quiz'
  weight_percentage: number
  max_score: number
  due_date: string
  description?: string
  is_required: boolean
  is_locked: boolean
  created_by: string
  created_at: string
  updated_at: string
  // Additional computed properties
  course?: {
    id: string
    name: string
    code: string
    department?: {
      name: string
    }
  }
  graded_count?: number
  total_students?: number
  submitted_count?: number
  instructor_name?: string
}

export interface AssessmentWithDetails extends Assessment {
  course: {
    id: string
    name: string
    code: string
    department: {
      name: string
    }
  }
  submitted_count: number
  graded_count: number
  total_students: number
  instructor_name: string
}

export interface StudentGrade {
  id: string
  student_id: string
  assessment_definition_id: string
  score: number | null
  submitted_date: string | null
  graded_date: string | null
  graded_by: string | null
  comments: string
  is_moderated: boolean
  moderated_by: string | null
  moderated_date: string | null
  created_at: string
  updated_at: string
}

export interface StudentGradeWithDetails extends StudentGrade {
  student: {
    student_number: string
    user: {
      full_name: string
    }
  }
  assessment: Assessment
  is_late: boolean
  // Flattened properties for easier access
  student_name: string
  student_number: string
  is_graded: boolean
}

export interface CourseResult {
  id: string
  student_id: string
  course_id: string
  semester_id: string
  total_score: number
  final_grade: 'HD' | 'D' | 'C' | 'P' | 'F' | 'W' | 'I'
  grade_points: number
  is_passed: boolean
  remarks?: string
  finalized_date?: string
  finalized_by?: string
}

export interface GradeImportResult {
  success: boolean
  imported_count: number
  failed_count: number
  errors: string[]
  warnings: string[]
}

// Assessment Management Functions
export const assessmentService = {
  // Create a new assessment
  async createAssessment(assessment: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('assessment_definitions')
        .insert([assessment])
        .select(`
          *,
          courses!inner(
            id,
            name,
            code,
            departments!inner(name)
          )
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  // Get all assessments with filters
  async getAssessments(filters: {
    instructor_id?: string
    course_id?: string
    semester_id?: string
    department_id?: string
  } = {}) {
    try {
      let query = supabase
        .from('assessment_definitions')
        .select(`
          *,
          courses!inner(
            id,
            name,
            code,
            departments!inner(name),
            course_instructors!inner(
              instructor_id,
              users!inner(full_name)
            )
          )
        `)

      // Apply filters
      if (filters.instructor_id) {
        query = query.eq('courses.course_instructors.instructor_id', filters.instructor_id)
      }
      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id)
      }
      if (filters.semester_id) {
        query = query.eq('semester_id', filters.semester_id)
      }
      if (filters.department_id) {
        query = query.eq('courses.department_id', filters.department_id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to include calculated fields
      const assessmentsWithDetails = await Promise.all(
        (data || []).map(async (assessment: any) => {
          const stats = await this.getAssessmentStats(assessment.id)
          return {
            ...assessment,
            submitted_count: stats.submitted_count,
            graded_count: stats.graded_count,
            total_students: stats.total_students,
            instructor_name: assessment.courses?.course_instructors?.[0]?.users?.full_name || 'Unknown'
          }
        })
      )

      return { data: assessmentsWithDetails, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  // Get assessment statistics
  async getAssessmentStats(assessment_id: string) {
    try {
      // Get total enrolled students for this assessment's course
      const { data: enrollmentData } = await supabase
        .from('student_enrollments')
        .select('student_id', { count: 'exact' })
        .eq('course_id', (await supabase
          .from('assessment_definitions')
          .select('course_id')
          .eq('id', assessment_id)
          .single()).data?.course_id)

      const total_students = enrollmentData?.length || 0

      // Get submitted and graded counts
      const { data: gradesData } = await supabase
        .from('student_assessments')
        .select('*')
        .eq('assessment_definition_id', assessment_id)

      const submitted_count = gradesData?.filter((g: any) => g.submitted_date).length || 0
      const graded_count = gradesData?.filter((g: any) => g.score !== null).length || 0

      return { total_students, submitted_count, graded_count }
    } catch (error) {
      return { total_students: 0, submitted_count: 0, graded_count: 0 }
    }
  },

  // Update assessment
  async updateAssessment(id: string, updates: Partial<Assessment>) {
    try {
      const { data, error } = await supabase
        .from('assessment_definitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  // Delete assessment
  async deleteAssessment(id: string) {
    try {
      const { error } = await supabase
        .from('assessment_definitions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  // Grade Management Functions
  async getStudentGrades(assessment_id: string) {
    try {
      const { data, error } = await supabase
        .from('student_assessments')
        .select(`
          *,
          students!inner(
            student_number,
            users!inner(full_name)
          ),
          assessment_definitions!inner(
            id,
            name,
            due_date,
            max_score
          )
        `)
        .eq('assessment_definition_id', assessment_id)

      if (error) throw error

      // Transform data to include calculated fields
      const gradesWithDetails = (data || []).map((grade: any) => ({
        ...grade,
        student_name: grade.students?.users?.full_name || 'Unknown',
        student_number: grade.students?.student_number || 'Unknown',
        is_late: grade.submitted_date && grade.assessment_definitions?.due_date
          ? new Date(grade.submitted_date) > new Date(grade.assessment_definitions.due_date)
          : false,
        is_graded: grade.score !== null
      }))

      return { data: gradesWithDetails, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  // Update student grade
  async updateStudentGrade(grade_id: string, updates: {
    score?: number | null
    comments?: string
    graded_by?: string
    graded_date?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('student_assessments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', grade_id)
        .select()
        .single()

      if (error) throw error

      // Trigger GPA recalculation
      await this.triggerGPARecalculation(data.student_id)

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  // Bulk update grades
  async bulkUpdateGrades(grades: Array<{
    grade_id: string
    score?: number | null
    comments?: string
    graded_by?: string
  }>) {
    try {
      const updates = grades.map(grade => ({
        id: grade.grade_id,
        score: grade.score,
        comments: grade.comments,
        graded_by: grade.graded_by,
        graded_date: grade.score !== null ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('student_assessments')
        .upsert(updates)
        .select()

      if (error) throw error

      // Trigger GPA recalculation for all affected students
      const student_ids = [...new Set(data?.map((g: any) => g.student_id) || [])]
      await Promise.all(student_ids.map((id: string) => this.triggerGPARecalculation(id)))

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  // Import grades from CSV
  async importGradesFromCSV(assessment_id: string, csv_data: Array<{
    student_number: string
    score: number
    comments?: string
  }>, graded_by: string): Promise<GradeImportResult> {
    try {
      let imported_count = 0
      let failed_count = 0
      const errors: string[] = []
      const warnings: string[] = []

      for (const row of csv_data) {
        try {
          // Find student by student number
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('id, user_id')
            .eq('student_number', row.student_number)
            .single()

          if (studentError || !studentData) {
            errors.push(`Student not found: ${row.student_number}`)
            failed_count++
            continue
          }

          // Check if assessment grade already exists
          const { data: existingGrade } = await supabase
            .from('student_assessments')
            .select('id')
            .eq('student_id', studentData.id)
            .eq('assessment_definition_id', assessment_id)
            .single()

          const gradeData = {
            student_id: studentData.id,
            assessment_definition_id: assessment_id,
            score: row.score,
            comments: row.comments || '',
            graded_by,
            graded_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          if (existingGrade) {
            // Update existing grade
            const { error: updateError } = await supabase
              .from('student_assessments')
              .update(gradeData)
              .eq('id', existingGrade.id)

            if (updateError) {
              errors.push(`Failed to update grade for ${row.student_number}: ${updateError.message}`)
              failed_count++
            } else {
              warnings.push(`Updated existing grade for ${row.student_number}`)
              imported_count++
            }
          } else {
            // Insert new grade
            const { error: insertError } = await supabase
              .from('student_assessments')
              .insert(gradeData)

            if (insertError) {
              errors.push(`Failed to insert grade for ${row.student_number}: ${insertError.message}`)
              failed_count++
            } else {
              imported_count++
            }
          }

          // Trigger GPA recalculation
          await this.triggerGPARecalculation(studentData.id)

        } catch (rowError) {
          errors.push(`Error processing ${row.student_number}: ${rowError}`)
          failed_count++
        }
      }

      return {
        success: failed_count === 0,
        imported_count,
        failed_count,
        errors,
        warnings
      }
    } catch (error) {
      return {
        success: false,
        imported_count: 0,
        failed_count: csv_data.length,
        errors: [`Import failed: ${error}`],
        warnings: []
      }
    }
  },

  // Export grades to CSV format
  async exportGradesToCSV(assessment_id: string) {
    try {
      const { data: grades } = await this.getStudentGrades(assessment_id)

      if (!grades) return { data: null, error: new Error('No grades found') }

      const csvData = grades.map((grade: any) => ({
        student_number: grade.student_number,
        student_name: grade.student_name,
        score: grade.score || '',
        percentage: grade.score ? ((grade.score / grade.assessment_definitions.max_score) * 100).toFixed(1) : '',
        comments: grade.comments || '',
        submitted_date: grade.submitted_date || '',
        graded_date: grade.graded_date || '',
        is_late: grade.is_late ? 'Yes' : 'No'
      }))

      return { data: csvData, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  // Student grade viewing functions
  async getStudentGradesByStudent(student_id: string, semester_id?: string) {
    try {
      let query = supabase
        .from('student_assessments')
        .select(`
          *,
          assessment_definitions!inner(
            id,
            name,
            type,
            weight_percentage,
            max_score,
            due_date,
            description,
            courses!inner(
              id,
              name,
              code,
              course_instructors!inner(
                users!inner(full_name)
              )
            )
          )
        `)
        .eq('student_id', student_id)

      if (semester_id) {
        query = query.eq('assessment_definitions.semester_id', semester_id)
      }

      const { data, error } = await query.order('assessment_definitions.due_date', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  // GPA Calculation Functions
  async triggerGPARecalculation(student_id: string) {
    try {
      // This would typically call a database function
      // For now, we'll implement the calculation in TypeScript
      await this.calculateAndUpdateGPA(student_id)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async calculateAndUpdateGPA(student_id: string) {
    try {
      // Get all course results for the student
      const { data: courseResults } = await supabase
        .from('course_results')
        .select(`
          *,
          courses!inner(credit_hours),
          semesters!inner(id, academic_year_id)
        `)
        .eq('student_id', student_id)

      if (!courseResults) return

      // Calculate semester and cumulative GPAs
      const semesterGPAs = new Map()
      let totalGradePoints = 0
      let totalCreditHours = 0

      for (const result of courseResults) {
        if (result.grade_points && result.courses.credit_hours) {
          const semesterId = result.semesters.id
          const gradePoints = result.grade_points * result.courses.credit_hours
          const credits = result.courses.credit_hours

          totalGradePoints += gradePoints
          totalCreditHours += credits

          // Track semester totals
          if (!semesterGPAs.has(semesterId)) {
            semesterGPAs.set(semesterId, { gradePoints: 0, credits: 0 })
          }
          const semesterData = semesterGPAs.get(semesterId)
          semesterData.gradePoints += gradePoints
          semesterData.credits += credits
        }
      }

      const cumulativeGPA = totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0

      // Update transcript records
      for (const [semesterId, semesterData] of semesterGPAs) {
        const semesterGPA = semesterData.credits > 0 ? semesterData.gradePoints / semesterData.credits : 0

        await supabase
          .from('transcripts')
          .upsert({
            student_id,
            semester_id: semesterId,
            semester_gpa: Math.round(semesterGPA * 100) / 100,
            cumulative_gpa: Math.round(cumulativeGPA * 100) / 100,
            cumulative_credit_hours: totalCreditHours,
            total_credit_hours: semesterData.credits,
            academic_status: this.determineAcademicStatus(cumulativeGPA),
            generated_date: new Date().toISOString().split('T')[0]
          })
      }

      return cumulativeGPA
    } catch (error) {
      console.error('GPA calculation error:', error)
      throw error
    }
  },

  determineAcademicStatus(gpa: number): string {
    if (gpa >= 3.5) return 'Dean\'s List'
    if (gpa >= 3.0) return 'Good Standing'
    if (gpa >= 2.0) return 'Satisfactory'
    if (gpa >= 1.0) return 'Probation'
    return 'Academic Suspension'
  },

  // Analytics Functions
  async getAssessmentAnalytics(filters: {
    semester_id?: string
    department_id?: string
    course_id?: string
  } = {}) {
    try {
      // Get overview stats
      const overviewQuery = supabase
        .from('assessment_definitions')
        .select(`
          id,
          courses!inner(
            id,
            name,
            departments!inner(id, name)
          ),
          student_assessments(count)
        `)

      // Apply filters
      let query = overviewQuery
      if (filters.semester_id) {
        query = query.eq('semester_id', filters.semester_id)
      }
      if (filters.department_id) {
        query = query.eq('courses.department_id', filters.department_id)
      }
      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id)
      }

      const { data: assessments } = await query

      // Calculate analytics data
      const totalAssessments = assessments?.length || 0
      const totalStudents = await this.getTotalStudentsCount(filters)
      const averageScore = await this.getAverageScore(filters)
      const completionRate = await this.getCompletionRate(filters)

      // Get performance distribution
      const performanceDistribution = await this.getPerformanceDistribution(filters)

      // Get course performance
      const coursePerformance = await this.getCoursePerformance(filters)

      return {
        data: {
          overview: {
            total_assessments: totalAssessments,
            total_students: totalStudents,
            average_completion_rate: completionRate,
            average_score: averageScore,
            pending_grades: await this.getPendingGradesCount(filters),
            courses_with_assessments: await this.getCoursesWithAssessmentsCount(filters)
          },
          performance_distribution: performanceDistribution,
          course_performance: coursePerformance
        },
        error: null
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async getTotalStudentsCount(filters: any) {
    // Implementation for getting total students count with filters
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
    return count || 0
  },

  async getAverageScore(filters: any) {
    // Implementation for calculating average score
    const { data } = await supabase
      .from('student_assessments')
      .select('score')
      .not('score', 'is', null)

    if (!data || data.length === 0) return 0
    const total = data.reduce((sum: number, item: any) => sum + (item.score || 0), 0)
    return total / data.length
  },

  async getCompletionRate(filters: any) {
    // Implementation for calculating completion rate
    const { data: allGrades } = await supabase
      .from('student_assessments')
      .select('score')

    if (!allGrades || allGrades.length === 0) return 0
    const graded = allGrades.filter((g: any) => g.score !== null).length
    return (graded / allGrades.length) * 100
  },

  async getPerformanceDistribution(filters: any) {
    // Implementation for performance distribution
    const { data } = await supabase
      .from('student_assessments')
      .select(`
        score,
        assessment_definitions!inner(max_score)
      `)
      .not('score', 'is', null)

    if (!data || data.length === 0) return []

    const distribution = {
      'HD (80-100%)': 0,
      'D (70-79%)': 0,
      'C (60-69%)': 0,
      'P (50-59%)': 0,
      'F (0-49%)': 0
    }

    data.forEach((item: any) => {
      const percentage = (item.score / item.assessment_definitions.max_score) * 100
      if (percentage >= 80) distribution['HD (80-100%)']++
      else if (percentage >= 70) distribution['D (70-79%)']++
      else if (percentage >= 60) distribution['C (60-69%)']++
      else if (percentage >= 50) distribution['P (50-59%)']++
      else distribution['F (0-49%)']++
    })

    const total = data.length
    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
  },

  async getCoursePerformance(filters: any) {
    // Implementation for course performance metrics
    return []
  },

  async getPendingGradesCount(filters: any) {
    const { count } = await supabase
      .from('student_assessments')
      .select('*', { count: 'exact', head: true })
      .is('score', null)
    return count || 0
  },

  async getCoursesWithAssessmentsCount(filters: any) {
    const { data } = await supabase
      .from('assessment_definitions')
      .select('course_id')

    if (!data) return 0
    const uniqueCourses = new Set(data.map((a: any) => a.course_id))
    return uniqueCourses.size
  }
}
