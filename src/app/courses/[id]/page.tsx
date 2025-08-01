'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BookOpen,
  Users,
  FileText,
  Plus,
  Calendar,
  Clock,
  Trophy,
  GraduationCap,
  Edit,
  Eye,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface Assessment {
  id: string
  title: string
  type: 'assignment' | 'midterm' | 'final' | 'quiz' | 'project' | 'practical'
  description: string
  total_marks: number
  weight_percentage: number
  due_date: string
  status: 'upcoming' | 'active' | 'completed' | 'graded'
  submission_count?: number
  average_score?: number
  student_submission?: {
    submitted_at: string
    score?: number
    grade?: string
    feedback?: string
    file_url?: string
  }
}

interface CourseDetails {
  id: string
  code: string
  name: string
  description: string
  department: string
  program: string
  year_level: number
  semester: string
  credit_hours: number
  instructor: string
  instructor_email: string
  enrolled_students: number
  current_grade?: string
  progress?: number
  syllabus_url?: string
}

interface Student {
  id: string
  student_number: string
  full_name: string
  email: string
  current_grade?: string
  attendance_percentage?: number
  total_score?: number
}

export default function CoursePage() {
  const params = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseDetails()
  }, [params.id])

  const fetchCourseDetails = async () => {
    // Mock data - replace with actual API calls
    const mockCourse: CourseDetails = {
      id: params.id as string,
      code: 'ENG201',
      name: 'Advanced Engineering Mathematics',
      description: 'This course covers advanced mathematical concepts essential for engineering applications including calculus, differential equations, linear algebra, and statistical analysis.',
      department: 'Engineering',
      program: 'Diploma in Civil Engineering',
      year_level: 2,
      semester: '1',
      credit_hours: 4,
      instructor: 'Dr. James Wilson',
      instructor_email: 'james.wilson@npi.pg',
      enrolled_students: 45,
      current_grade: user?.role === 'student' ? 'B+' : undefined,
      progress: user?.role === 'student' ? 65 : undefined,
      syllabus_url: '/syllabus/eng201.pdf'
    }

    const mockAssessments: Assessment[] = [
      {
        id: '1',
        title: 'Calculus Problem Set 1',
        type: 'assignment',
        description: 'Solve differential equations and integration problems',
        total_marks: 100,
        weight_percentage: 15,
        due_date: '2024-02-15',
        status: 'active',
        submission_count: 42,
        average_score: 78,
        student_submission: user?.role === 'student' ? {
          submitted_at: '2024-02-14T15:30:00Z',
          score: 85,
          grade: 'HD',
          feedback: 'Excellent work on differential equations. Minor error in question 3.',
          file_url: '/submissions/student_assignment1.pdf'
        } : undefined
      },
      {
        id: '2',
        title: 'Midterm Examination',
        type: 'midterm',
        description: 'Comprehensive test covering modules 1-4',
        total_marks: 100,
        weight_percentage: 30,
        due_date: '2024-03-01',
        status: 'upcoming',
        submission_count: 0,
        average_score: 0
      },
      {
        id: '3',
        title: 'Linear Algebra Quiz',
        type: 'quiz',
        description: 'Matrix operations and vector spaces',
        total_marks: 50,
        weight_percentage: 10,
        due_date: '2024-01-30',
        status: 'graded',
        submission_count: 45,
        average_score: 82,
        student_submission: user?.role === 'student' ? {
          submitted_at: '2024-01-30T14:00:00Z',
          score: 45,
          grade: 'HD',
          feedback: 'Perfect understanding of matrix operations.'
        } : undefined
      },
      {
        id: '4',
        title: 'Engineering Project',
        type: 'project',
        description: 'Design and analysis of a structural system',
        total_marks: 100,
        weight_percentage: 25,
        due_date: '2024-04-15',
        status: 'upcoming',
        submission_count: 0,
        average_score: 0
      },
      {
        id: '5',
        title: 'Final Examination',
        type: 'final',
        description: 'Comprehensive final exam covering all modules',
        total_marks: 100,
        weight_percentage: 20,
        due_date: '2024-05-20',
        status: 'upcoming',
        submission_count: 0,
        average_score: 0
      }
    ]

    const mockStudents: Student[] = [
      {
        id: '1',
        student_number: 'NPI2024DCE001',
        full_name: 'John Michael Doe',
        email: 'john.doe@email.com',
        current_grade: 'HD',
        attendance_percentage: 92,
        total_score: 85
      },
      {
        id: '2',
        student_number: 'NPI2024DCE002',
        full_name: 'Jane Smith',
        email: 'jane.smith@email.com',
        current_grade: 'D',
        attendance_percentage: 88,
        total_score: 78
      },
      {
        id: '3',
        student_number: 'NPI2024DCE003',
        full_name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        current_grade: 'C',
        attendance_percentage: 85,
        total_score: 72
      }
    ]

    setCourse(mockCourse)
    setAssessments(mockAssessments)
    setStudents(mockStudents)
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600">Upcoming</Badge>
      case 'active':
        return <Badge variant="outline" className="text-green-600">Active</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-yellow-600">Completed</Badge>
      case 'graded':
        return <Badge variant="outline" className="text-purple-600">Graded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'HD':
        return 'bg-green-100 text-green-800'
      case 'D':
        return 'bg-blue-100 text-blue-800'
      case 'C':
        return 'bg-yellow-100 text-yellow-800'
      case 'P':
        return 'bg-orange-100 text-orange-800'
      case 'F':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isInstructor = () => {
    return user?.role === 'instructor' || user?.role === 'tutor'
  }

  const isStudent = () => {
    return user?.role === 'student'
  }

  const canManage = () => {
    return user?.role === 'admin' || user?.role === 'department_head' ||
           (isInstructor() && course?.instructor === user?.full_name)
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading course details...</div>
  }

  if (!course) {
    return <div className="container mx-auto py-8">Course not found</div>
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-8 w-8 mr-3" />
              {course.code}: {course.name}
            </h1>
            <p className="text-gray-600 mt-2">{course.description}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge variant="secondary">{course.department}</Badge>
              <Badge variant="outline">Year {course.year_level}, Semester {course.semester}</Badge>
              <Badge variant="outline">{course.credit_hours} Credits</Badge>
            </div>
          </div>

          {canManage() && (
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/courses/${course.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/courses/${course.id}/assessments/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Assessment
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-lg font-bold">{course.enrolled_students}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Instructor</p>
                  <p className="text-lg font-bold">{course.instructor}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {course.current_grade && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Current Grade</p>
                    <Badge className={getGradeColor(course.current_grade)}>
                      {course.current_grade}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {course.progress && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div className="w-full">
                    <p className="text-sm text-gray-600">Progress</p>
                    <Progress value={course.progress} className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">{course.progress}% Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          {!isStudent() && <TabsTrigger value="students">Students</TabsTrigger>}
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Assessments</h2>
            {canManage() && (
              <Button asChild>
                <Link href={`/courses/${course.id}/assessments/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Link>
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>{assessment.title}</span>
                        {getStatusBadge(assessment.status)}
                      </CardTitle>
                      <CardDescription>{assessment.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{assessment.total_marks} marks</p>
                      <p className="text-sm text-gray-600">{assessment.weight_percentage}% of final grade</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{new Date(assessment.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <Badge variant="outline" className="capitalize">{assessment.type}</Badge>
                    </div>
                    {!isStudent() && (
                      <div>
                        <p className="text-sm text-gray-600">Submissions</p>
                        <p className="font-medium">{assessment.submission_count} / {course.enrolled_students}</p>
                      </div>
                    )}
                  </div>

                  {/* Student Submission Status */}
                  {isStudent() && assessment.student_submission && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Submitted</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Submitted At</p>
                          <p>{new Date(assessment.student_submission.submitted_at).toLocaleString()}</p>
                        </div>
                        {assessment.student_submission.score && (
                          <div>
                            <p className="text-gray-600">Score</p>
                            <p className="font-bold">
                              {assessment.student_submission.score}/{assessment.total_marks}
                              ({((assessment.student_submission.score / assessment.total_marks) * 100).toFixed(1)}%)
                            </p>
                          </div>
                        )}
                      </div>
                      {assessment.student_submission.feedback && (
                        <div className="mt-2">
                          <p className="text-gray-600 text-sm">Feedback</p>
                          <p className="text-sm">{assessment.student_submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Student Submit Button */}
                  {isStudent() && assessment.status === 'active' && !assessment.student_submission && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-center">
                          <span>This assessment is due on {new Date(assessment.due_date).toLocaleDateString()}</span>
                          <Button asChild>
                            <Link href={`/courses/${course.id}/assessments/${assessment.id}/submit`}>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit Work
                            </Link>
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/courses/${course.id}/assessments/${assessment.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>

                    {canManage() && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}/assessments/${assessment.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}/assessments/${assessment.id}/grade`}>
                            <FileText className="h-4 w-4 mr-2" />
                            Grade ({assessment.submission_count})
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <h2 className="text-2xl font-bold">Grade Breakdown</h2>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>{assessment.title}</TableCell>
                      <TableCell className="capitalize">{assessment.type}</TableCell>
                      <TableCell>{assessment.weight_percentage}%</TableCell>
                      <TableCell>
                        {assessment.student_submission?.score ?
                          `${assessment.student_submission.score}/${assessment.total_marks}` :
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {assessment.student_submission?.grade ? (
                          <Badge className={getGradeColor(assessment.student_submission.grade)}>
                            {assessment.student_submission.grade}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {!isStudent() && (
          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Enrolled Students</h2>
              <Button variant="outline" asChild>
                <Link href={`/courses/${course.id}/students/export`}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Grades
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Student Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Grade</TableHead>
                      <TableHead>Total Score</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.student_number}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {student.current_grade && (
                            <Badge className={getGradeColor(student.current_grade)}>
                              {student.current_grade}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{student.total_score}%</TableCell>
                        <TableCell>{student.attendance_percentage}%</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}/students/${student.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="materials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Course Materials</h2>
            {canManage() && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Course Syllabus</h3>
                      <p className="text-sm text-gray-600">Complete course outline and schedule</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium">Lecture Notes - Module 1</h3>
                      <p className="text-sm text-gray-600">Introduction to Calculus</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium">Practice Problems</h3>
                      <p className="text-sm text-gray-600">Additional exercises for practice</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
