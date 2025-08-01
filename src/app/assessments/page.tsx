'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, PlusIcon, EditIcon, UsersIcon, BarChart3Icon, GraduationCapIcon, AlertCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { assessmentService, type AssessmentWithDetails } from '@/lib/services/assessments'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Course {
  id: string
  name: string
  code: string
  enrolled_students: number
}

const AssessmentManagementPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<AssessmentWithDetails[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [currentSemester, setCurrentSemester] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    type: 'assignment' as const,
    course_id: '',
    weight_percentage: 0,
    max_score: 100,
    due_date: '',
    description: '',
    is_required: true
  })

  // Load assessments and courses data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current semester
        const { data: semesterData } = await supabase
          .from('semesters')
          .select('id')
          .eq('is_current', true)
          .single()

        if (semesterData) {
          setCurrentSemester(semesterData.id)
        }

        // Load courses based on user role
        let coursesQuery = supabase
          .from('courses')
          .select(`
            id,
            name,
            code,
            student_enrollments(count)
          `)

        // Filter courses based on user role
        if (user?.role === 'instructor' || user?.role === 'tutor') {
          coursesQuery = coursesQuery
            .eq('course_instructors.instructor_id', user.id)
        }

        const { data: coursesData, error: coursesError } = await coursesQuery

        if (coursesError) throw coursesError

        const formattedCourses = (coursesData || []).map((course: any) => ({
          id: course.id,
          name: course.name,
          code: course.code,
          enrolled_students: course.student_enrollments?.length || 0
        }))

        setCourses(formattedCourses)

        // Load assessments
        const filters: any = {}
        if (user?.role === 'instructor' || user?.role === 'tutor') {
          filters.instructor_id = user.id
        }
        if (semesterData) {
          filters.semester_id = semesterData.id
        }

        const { data: assessmentsData, error: assessmentsError } = await assessmentService.getAssessments(filters)

        if (assessmentsError) throw assessmentsError

        setAssessments(assessmentsData || [])

      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  const filteredAssessments = assessments.filter(assessment =>
    (selectedCourse === '' || assessment.course_id === selectedCourse) &&
    (assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assessment.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assessment.course.code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleCreateAssessment = async () => {
    try {
      if (!user || !currentSemester) {
        setError('User or semester not found')
        return
      }

      if (!newAssessment.name || !newAssessment.course_id || !newAssessment.due_date) {
        setError('Please fill in all required fields')
        return
      }

      const assessmentData = {
        ...newAssessment,
        semester_id: currentSemester,
        created_by: user.id,
        is_locked: false
      }

      const { data, error: createError } = await assessmentService.createAssessment(assessmentData)

      if (createError) {
        setError(createError.message)
        return
      }

      // Refresh assessments list
      const filters: any = {}
      if (user?.role === 'instructor' || user?.role === 'tutor') {
        filters.instructor_id = user.id
      }
      if (currentSemester) {
        filters.semester_id = currentSemester
      }

      const { data: updatedAssessments } = await assessmentService.getAssessments(filters)
      setAssessments(updatedAssessments || [])

      setIsCreateDialogOpen(false)
      setNewAssessment({
        name: '',
        type: 'assignment',
        course_id: '',
        weight_percentage: 0,
        max_score: 100,
        due_date: '',
        description: '',
        is_required: true
      })
    } catch (err) {
      console.error('Error creating assessment:', err)
      setError(err instanceof Error ? err.message : 'Failed to create assessment')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessments...</p>
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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessment Management</h1>
          <p className="text-gray-600">Manage assessments, assignments, and grades for your courses</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Assessment</DialogTitle>
              <DialogDescription>
                Add a new assessment for your course students
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Assessment Name</Label>
                  <Input
                    id="name"
                    value={newAssessment.name}
                    onChange={(e) => setNewAssessment({...newAssessment, name: e.target.value})}
                    placeholder="e.g., Midterm Exam"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Assessment Type</Label>
                  <Select value={newAssessment.type} onValueChange={(value) => setNewAssessment({...newAssessment, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="midterm">Midterm Exam</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="final">Final Exam</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={newAssessment.course_id} onValueChange={(value) => setNewAssessment({...newAssessment, course_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newAssessment.due_date}
                    onChange={(e) => setNewAssessment({...newAssessment, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (%)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    max="100"
                    value={newAssessment.weight_percentage}
                    onChange={(e) => setNewAssessment({...newAssessment, weight_percentage: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_score">Max Score</Label>
                  <Input
                    id="max_score"
                    type="number"
                    min="1"
                    value={newAssessment.max_score}
                    onChange={(e) => setNewAssessment({...newAssessment, max_score: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment({...newAssessment, description: e.target.value})}
                  placeholder="Assessment description and instructions..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssessment} className="bg-blue-600 hover:bg-blue-700">
                Create Assessment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
              </div>
              <GraduationCapIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-bold text-orange-600">
                  {assessments.reduce((sum, a) => sum + (a.submitted_count - a.graded_count), 0)}
                </p>
              </div>
              <EditIcon className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {courses.reduce((sum, c) => sum + c.enrolled_students, 0)}
                </p>
              </div>
              <UsersIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {assessments.length > 0 ? Math.round(assessments.reduce((sum, a) => sum + (a.total_students > 0 ? (a.graded_count / a.total_students * 100) : 0), 0) / assessments.length) : 0}%
                </p>
              </div>
              <BarChart3Icon className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessments</CardTitle>
          <CardDescription>Manage and track your course assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{assessment.name}</p>
                      <p className="text-sm text-gray-500">Max: {assessment.max_score} points</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{assessment.course.code}</p>
                      <p className="text-sm text-gray-600">{assessment.course.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getTypeColor(assessment.type))}>
                      {assessment.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-900">{assessment.weight_percentage}%</TableCell>
                  <TableCell className="text-gray-900">
                    {new Date(assessment.due_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Graded: {assessment.graded_count}/{assessment.total_students}</span>
                        <span className={getProgressColor(assessment.total_students > 0 ? (assessment.graded_count / assessment.total_students) * 100 : 0)}>
                          {assessment.total_students > 0 ? Math.round((assessment.graded_count / assessment.total_students) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${assessment.total_students > 0 ? (assessment.graded_count / assessment.total_students) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/assessments/${assessment.id}/grades`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Enter Grades
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/assessments/${assessment.id}`)}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssessmentManagementPage
