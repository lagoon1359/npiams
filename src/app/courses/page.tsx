'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, BookOpen, Users, Calendar, Search, Eye, Edit, FileText, Loader2 } from 'lucide-react'
import type { UserRole } from '@/lib/supabase'

interface CourseData {
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
  enrolled_students: number
  max_students?: number
  average_grade?: number
  progress?: number
  next_assessment?: {
    name: string
    due_date: string
  }
  is_enrolled?: boolean
  current_grade?: string
}

export default function CoursesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<CourseData[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user])

  useEffect(() => {
    filterCourses()
  }, [courses, searchQuery, departmentFilter, yearFilter])

  const fetchCourses = async () => {
    // Simulated data - replace with actual Supabase calls
    const mockCourses: CourseData[] = [
      {
        id: '1',
        code: 'ENG201',
        name: 'Advanced Engineering Mathematics',
        description: 'Advanced mathematical concepts for engineering applications',
        department: 'Engineering',
        program: 'Diploma in Civil Engineering',
        year_level: 2,
        semester: '1',
        credit_hours: 4,
        instructor: 'Dr. James Wilson',
        enrolled_students: 45,
        max_students: 50,
        average_grade: 2.9,
        progress: 65,
        next_assessment: {
          name: 'Final Exam',
          due_date: '2024-02-15'
        },
        is_enrolled: user?.role === 'student',
        current_grade: user?.role === 'student' ? 'B+' : undefined,
      },
      {
        id: '2',
        code: 'ENG301',
        name: 'Structural Analysis',
        description: 'Analysis of structural systems and components',
        department: 'Engineering',
        program: 'Diploma in Civil Engineering',
        year_level: 3,
        semester: '1',
        credit_hours: 3,
        instructor: 'Prof. Sarah Johnson',
        enrolled_students: 38,
        max_students: 40,
        average_grade: 3.1,
        progress: 70,
        next_assessment: {
          name: 'Design Project',
          due_date: '2024-02-10'
        },
        is_enrolled: false,
      },
      {
        id: '3',
        code: 'BUS201',
        name: 'Financial Management',
        description: 'Principles and practices of financial management',
        department: 'Business',
        program: 'Diploma in Business Management',
        year_level: 2,
        semester: '1',
        credit_hours: 4,
        instructor: 'Ms. Emily Davis',
        enrolled_students: 32,
        max_students: 35,
        average_grade: 2.8,
        progress: 60,
        is_enrolled: false,
      },
      {
        id: '4',
        code: 'SCI201',
        name: 'Applied Physics',
        description: 'Physics applications in technology and engineering',
        department: 'Sciences',
        program: 'Diploma in Applied Sciences',
        year_level: 2,
        semester: '1',
        credit_hours: 3,
        instructor: 'Dr. Robert Chen',
        enrolled_students: 28,
        max_students: 30,
        average_grade: 2.7,
        progress: 55,
        is_enrolled: false,
      },
    ]

    setCourses(mockCourses)
    setLoading(false)
  }

  const filterCourses = () => {
    let filtered = courses

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(course => course.department === departmentFilter)
    }

    // Year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(course => course.year_level.toString() === yearFilter)
    }

    // Role-based filtering
    if (user?.role === 'student') {
      // Students only see courses they're enrolled in or can enroll in
      // For demo, we'll show all courses but mark enrollment status
    } else if (user?.role === 'instructor' || user?.role === 'tutor') {
      // Instructors only see courses they teach
      filtered = filtered.filter(course => course.instructor === user.full_name)
    }

    setFilteredCourses(filtered)
  }

  const getUniqueDepartments = () => {
    return [...new Set(courses.map(course => course.department))]
  }

  const getUniqueYears = () => {
    return [...new Set(courses.map(course => course.year_level))]
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
      case 'A+':
        return 'bg-green-100 text-green-800'
      case 'A-':
      case 'B+':
        return 'bg-blue-100 text-blue-800'
      case 'B':
      case 'B-':
        return 'bg-yellow-100 text-yellow-800'
      case 'C':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const canManageCourses = () => {
    return user?.role === 'admin' || user?.role === 'department_head'
  }

  const isInstructor = () => {
    return user?.role === 'instructor' || user?.role === 'tutor'
  }

  const isStudent = () => {
    return user?.role === 'student'
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isStudent() ? 'My Courses' : 'Course Management'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isStudent()
              ? 'View your enrolled courses and progress'
              : isInstructor()
              ? 'Manage your teaching courses'
              : 'Manage all academic courses'
            }
          </p>
        </div>
        {canManageCourses() && (
          <Button asChild>
            <Link href="/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {getUniqueDepartments().map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {getUniqueYears().map((year) => (
                  <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              {filteredCourses.length} courses found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Cards for Students */}
      {isStudent() && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.code}</CardTitle>
                    <CardDescription className="font-medium">{course.name}</CardDescription>
                  </div>
                  {course.current_grade && (
                    <Badge className={getGradeColor(course.current_grade)}>
                      {course.current_grade}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Instructor:</strong> {course.instructor}</p>
                    <p><strong>Credits:</strong> {course.credit_hours}</p>
                    <p><strong>Year:</strong> {course.year_level}, Semester {course.semester}</p>
                  </div>

                  {course.progress && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}

                  {course.next_assessment && (
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-sm font-medium">Next Assessment:</p>
                      <p className="text-sm">{course.next_assessment.name}</p>
                      <p className="text-xs text-gray-500">Due: {course.next_assessment.due_date}</p>
                    </div>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/courses/${course.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Course
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Table for Admin/Instructors */}
      {!isStudent() && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isInstructor() ? 'My Teaching Courses' : 'All Courses'}
            </CardTitle>
            <CardDescription>
              {isInstructor()
                ? 'Courses you are currently teaching'
                : 'Overview of all academic courses'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year/Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Students</TableHead>
                  {!isInstructor() && <TableHead>Avg Grade</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.code}</div>
                        <div className="text-sm text-gray-500">{course.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{course.department}</Badge>
                    </TableCell>
                    <TableCell>
                      Year {course.year_level}, Sem {course.semester}
                    </TableCell>
                    <TableCell>{course.credit_hours}</TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>
                      {course.enrolled_students}
                      {course.max_students && ` / ${course.max_students}`}
                    </TableCell>
                    {!isInstructor() && (
                      <TableCell>{course.average_grade?.toFixed(1) || '-'}</TableCell>
                    )}
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/courses/${course.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {(canManageCourses() || (isInstructor() && course.instructor === user.full_name)) && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {isInstructor() && course.instructor === user.full_name && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}/grades`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
