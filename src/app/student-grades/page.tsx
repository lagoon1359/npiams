'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { TrendingUpIcon, TrendingDownIcon, BookOpenIcon, GraduationCapIcon, TargetIcon, DownloadIcon, MessageSquareIcon, AlertCircleIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { assessmentService } from '@/lib/services/assessments'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface StudentGradeView {
  id: string
  assessment_name: string
  course_name: string
  course_code: string
  assessment_type: 'assignment' | 'midterm' | 'practical' | 'final' | 'project' | 'quiz'
  score: number | null
  max_score: number
  weight_percentage: number
  graded_date: string | null
  instructor_comments: string
  semester: string
  academic_year: string
  due_date: string
  submitted_date: string | null
  instructor_name: string
}

interface CourseGradeView {
  course_id: string
  course_name: string
  course_code: string
  semester: string
  academic_year: string
  total_score: number
  final_grade: string
  grade_points: number
  credit_hours: number
  instructor_name: string
  is_passed: boolean
}

interface GpaData {
  semester_gpa: number
  cumulative_gpa: number
  total_credits_attempted: number
  total_credits_earned: number
  academic_standing: string
}

const StudentGradesPage = () => {
  const { user } = useAuth()
  const [studentGrades, setStudentGrades] = useState<StudentGradeView[]>([])
  const [courseGrades, setCourseGrades] = useState<CourseGradeView[]>([])
  const [gpaData, setGpaData] = useState<GpaData | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<string>('current')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('assessments')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)

  // Load student data
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user) {
          setError('User not authenticated')
          return
        }

        // Get student record
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (studentError || !studentData) {
          setError('Student record not found')
          return
        }

        setStudentId(studentData.id)

        // Get current semester
        const { data: semesterData } = await supabase
          .from('semesters')
          .select('id, semester_type, academic_years(year_name)')
          .eq('is_current', true)
          .single()

        // Load student grades
        const { data: gradesData, error: gradesError } = await assessmentService.getStudentGradesByStudent(
          studentData.id,
          selectedSemester === 'current' ? semesterData?.id : undefined
        )

        if (gradesError) throw gradesError

        // Transform grades data
        const transformedGrades = (gradesData || []).map((grade: any) => ({
          id: grade.id,
          assessment_name: grade.assessment_definitions.name,
          course_name: grade.assessment_definitions.courses.name,
          course_code: grade.assessment_definitions.courses.code,
          assessment_type: grade.assessment_definitions.type,
          score: grade.score,
          max_score: grade.assessment_definitions.max_score,
          weight_percentage: grade.assessment_definitions.weight_percentage,
          graded_date: grade.graded_date,
          instructor_comments: grade.comments || '',
          semester: 'Current Semester', // You might want to get this from the semester data
          academic_year: semesterData?.academic_years?.year_name || '2024',
          due_date: grade.assessment_definitions.due_date,
          submitted_date: grade.submitted_date,
          instructor_name: grade.assessment_definitions.courses.course_instructors?.[0]?.users?.full_name || 'Unknown'
        }))

        setStudentGrades(transformedGrades)

        // Load course results
        const { data: courseResultsData } = await supabase
          .from('course_results')
          .select(`
            *,
            courses!inner(
              name,
              code,
              credit_hours,
              course_instructors!inner(
                users!inner(full_name)
              )
            ),
            semesters!inner(
              semester_type,
              academic_years!inner(year_name)
            )
          `)
          .eq('student_id', studentData.id)

        const transformedCourseGrades = (courseResultsData || []).map((result: any) => ({
          course_id: result.course_id,
          course_name: result.courses.name,
          course_code: result.courses.code,
          semester: `Semester ${result.semesters.semester_type}`,
          academic_year: result.semesters.academic_years.year_name,
          total_score: result.total_score || 0,
          final_grade: result.final_grade || 'TBD',
          grade_points: result.grade_points || 0,
          credit_hours: result.courses.credit_hours,
          instructor_name: result.courses.course_instructors?.[0]?.users?.full_name || 'Unknown',
          is_passed: result.is_passed || false
        }))

        setCourseGrades(transformedCourseGrades)

        // Load GPA data
        const { data: transcriptData } = await supabase
          .from('transcripts')
          .select('*')
          .eq('student_id', studentData.id)
          .order('generated_date', { ascending: false })
          .limit(1)
          .single()

        if (transcriptData) {
          setGpaData({
            semester_gpa: transcriptData.semester_gpa || 0,
            cumulative_gpa: transcriptData.cumulative_gpa || 0,
            total_credits_attempted: transcriptData.total_credit_hours || 0,
            total_credits_earned: transcriptData.cumulative_credit_hours || 0,
            academic_standing: transcriptData.academic_status || 'N/A'
          })
        } else {
          // Calculate GPA if no transcript record exists
          const totalGradePoints = transformedCourseGrades.reduce((sum: number, course: any) =>
            sum + (course.grade_points * course.credit_hours), 0)
          const totalCreditHours = transformedCourseGrades.reduce((sum: number, course: any) =>
            sum + course.credit_hours, 0)
          const gpa = totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0

          setGpaData({
            semester_gpa: gpa,
            cumulative_gpa: gpa,
            total_credits_attempted: totalCreditHours,
            total_credits_earned: transformedCourseGrades.filter((c: any) => c.is_passed).reduce((sum: number, c: any) => sum + c.credit_hours, 0),
            academic_standing: gpa >= 3.0 ? 'Good Standing' : gpa >= 2.0 ? 'Satisfactory' : 'Probation'
          })
        }

      } catch (err) {
        console.error('Error loading student data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadStudentData()
    }
  }, [user, selectedSemester])

  const filteredGrades = studentGrades.filter(grade =>
    (selectedSemester === 'current' || grade.semester === selectedSemester) &&
    (grade.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     grade.assessment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     grade.course_code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getGradeColor = (score: number | null, maxScore: number) => {
    if (score === null) return 'text-gray-500'
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 70) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      assignment: 'bg-blue-100 text-blue-800',
      midterm: 'bg-yellow-100 text-yellow-800',
      practical: 'bg-green-100 text-green-800',
      final: 'bg-red-100 text-red-800',
      project: 'bg-purple-100 text-purple-800',
      quiz: 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const calculateProgress = () => {
    const totalAssessments = studentGrades.length
    const gradedAssessments = studentGrades.filter(g => g.score !== null).length
    return (gradedAssessments / totalAssessments) * 100
  }

  const getAverageScore = () => {
    const gradedAssessments = studentGrades.filter(g => g.score !== null)
    if (gradedAssessments.length === 0) return 0

    const weightedSum = gradedAssessments.reduce((sum, grade) => {
      const percentage = (grade.score! / grade.max_score) * 100
      return sum + (percentage * grade.weight_percentage / 100)
    }, 0)

    const totalWeight = gradedAssessments.reduce((sum, grade) => sum + grade.weight_percentage, 0)
    return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your grades...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircleIcon className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600">View your academic performance and feedback</p>
        </div>
        <Button variant="outline" onClick={() => window.open('/transcript-generator', '_blank')}>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download Transcript
        </Button>
      </div>

      {/* GPA Overview */}
      {gpaData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current GPA</p>
                  <p className="text-2xl font-bold text-blue-600">{gpaData.semester_gpa.toFixed(2)}</p>
                </div>
                <GraduationCapIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cumulative GPA</p>
                  <p className="text-2xl font-bold text-green-600">{gpaData.cumulative_gpa.toFixed(2)}</p>
                </div>
                <TrendingUpIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Credits Earned</p>
                  <p className="text-2xl font-bold text-purple-600">{gpaData.total_credits_earned}/{gpaData.total_credits_attempted}</p>
                </div>
                <BookOpenIcon className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Academic Standing</p>
                  <p className="text-lg font-bold text-gray-900">{gpaData.academic_standing}</p>
                </div>
                <TargetIcon className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assessment Progress</h3>
              <span className="text-sm text-gray-600">{calculateProgress().toFixed(0)}% complete</span>
            </div>
            <Progress value={calculateProgress()} className="w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{getAverageScore().toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{studentGrades.filter(g => g.score !== null).length}</p>
                <p className="text-sm text-gray-600">Assessments Graded</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{studentGrades.filter(g => g.score === null).length}</p>
                <p className="text-sm text-gray-600">Pending Results</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="courses">Course Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Semester</SelectItem>
                    <SelectItem value="Semester 1">Semester 1</SelectItem>
                    <SelectItem value="Semester 2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assessments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
              <CardDescription>Your individual assessment scores and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{grade.assessment_name}</p>
                          <p className="text-sm text-gray-500">Due: {new Date(grade.due_date).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{grade.course_code}</p>
                          <p className="text-sm text-gray-600">{grade.course_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize", getTypeColor(grade.assessment_type))}>
                          {grade.assessment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {grade.score !== null ? (
                          <div>
                            <p className={cn("font-bold", getGradeColor(grade.score, grade.max_score))}>
                              {grade.score}/{grade.max_score}
                            </p>
                            <p className={cn("text-sm", getGradeColor(grade.score, grade.max_score))}>
                              {((grade.score / grade.max_score) * 100).toFixed(1)}%
                            </p>
                          </div>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900">{grade.weight_percentage}%</TableCell>
                      <TableCell>
                        {grade.score !== null ? (
                          <Badge className="bg-green-100 text-green-800">Graded</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MessageSquareIcon className="w-4 h-4 mr-1" />
                              Feedback
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>{grade.assessment_name}</DialogTitle>
                              <DialogDescription>
                                {grade.course_code} - {grade.course_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900">Score</h4>
                                  {grade.score !== null ? (
                                    <p className={cn("text-lg font-bold", getGradeColor(grade.score, grade.max_score))}>
                                      {grade.score}/{grade.max_score} ({((grade.score / grade.max_score) * 100).toFixed(1)}%)
                                    </p>
                                  ) : (
                                    <p className="text-gray-500">Not yet graded</p>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">Weight</h4>
                                  <p className="text-lg">{grade.weight_percentage}% of course grade</p>
                                </div>
                              </div>
                              <Separator />
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Instructor Feedback</h4>
                                {grade.instructor_comments ? (
                                  <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-gray-800">{grade.instructor_comments}</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 italic">No feedback provided yet</p>
                                )}
                              </div>
                              <Separator />
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <h5 className="font-medium text-gray-700">Submitted</h5>
                                  <p>{grade.submitted_date ? new Date(grade.submitted_date).toLocaleDateString() : 'Not submitted'}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-700">Graded</h5>
                                  <p>{grade.graded_date ? new Date(grade.graded_date).toLocaleDateString() : 'Not graded'}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Grades</CardTitle>
              <CardDescription>Your final grades for each course</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Grade Points</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseGrades.map((course) => (
                    <TableRow key={course.course_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{course.course_code}</p>
                          <p className="text-sm text-gray-600">{course.course_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">{course.instructor_name}</TableCell>
                      <TableCell className="text-gray-900">{course.credit_hours}</TableCell>
                      <TableCell>
                        {course.total_score > 0 ? (
                          <p className={cn("font-medium", getGradeColor(course.total_score, 100))}>
                            {course.total_score.toFixed(1)}%
                          </p>
                        ) : (
                          <Badge variant="secondary">TBD</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "font-bold",
                          course.final_grade === 'TBD' ? "bg-gray-100 text-gray-800" :
                          course.is_passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                          {course.final_grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-900">{course.grade_points.toFixed(1)}</TableCell>
                      <TableCell>
                        {course.final_grade === 'TBD' ? (
                          <Badge variant="secondary">In Progress</Badge>
                        ) : course.is_passed ? (
                          <Badge className="bg-green-100 text-green-800">Passed</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudentGradesPage
