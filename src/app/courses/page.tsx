'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  BookOpen,
  Search,
  Users,
  GraduationCap,
  Building2
} from 'lucide-react'
import { CourseService, type CourseWithDetails } from '@/lib/services/courses'
import { DepartmentService, type DepartmentWithDetails } from '@/lib/services/departments'
import { ProgramService, type ProgramWithDetails } from '@/lib/services/programs'

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseWithDetails[]>([])
  const [departments, setDepartments] = useState<DepartmentWithDetails[]>([])
  const [programs, setPrograms] = useState<ProgramWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [semesterFilter, setSemesterFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Stats state
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    coursesByYear: { 1: 0, 2: 0, 3: 0, 4: 0 },
    coursesBySemester: { '1': 0, '2': 0 }
  })

  useEffect(() => {
    loadCourses()
    loadDepartments()
    loadPrograms()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [courses])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await CourseService.getAllCourses({ is_active: true })
      setCourses(data)
    } catch (error: any) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const data = await DepartmentService.getAllDepartments()
      setDepartments(data)
    } catch (error: any) {
      console.error('Error loading departments:', error)
    }
  }

  const loadPrograms = async () => {
    try {
      const data = await ProgramService.getAllPrograms({ is_active: true })
      setPrograms(data)
    } catch (error: any) {
      console.error('Error loading programs:', error)
    }
  }

  const calculateStats = () => {
    const totalCourses = courses.length
    const totalStudents = courses.reduce((sum, course) => sum + course.total_students, 0)
    const totalInstructors = new Set(courses.flatMap(course => course.instructors.map(i => i.id))).size

    const coursesByYear = { 1: 0, 2: 0, 3: 0, 4: 0 }
    const coursesBySemester = { '1': 0, '2': 0 }

    courses.forEach(course => {
      coursesByYear[course.year_level as keyof typeof coursesByYear]++
      coursesBySemester[course.semester as keyof typeof coursesBySemester]++
    })

    setStats({
      totalCourses,
      totalStudents,
      totalInstructors,
      coursesByYear,
      coursesBySemester
    })
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.program.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesDepartment = departmentFilter === 'all' || course.department_id === departmentFilter
    const matchesProgram = programFilter === 'all' || course.program_id === programFilter
    const matchesYear = yearFilter === 'all' || course.year_level.toString() === yearFilter
    const matchesSemester = semesterFilter === 'all' || course.semester === semesterFilter

    return matchesSearch && matchesDepartment && matchesProgram && matchesYear && matchesSemester
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Course Management
          </h1>
          <p className="text-gray-600 mt-2">View and manage academic courses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstructors}</div>
            <p className="text-xs text-muted-foreground">Teaching staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year 1 Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesByYear[1]}</div>
            <p className="text-xs text-muted-foreground">First year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year 2 Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesByYear[2]}</div>
            <p className="text-xs text-muted-foreground">Second year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year 3 Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesByYear[3]}</div>
            <p className="text-xs text-muted-foreground">Third year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Year 4 Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesByYear[4]}</div>
            <p className="text-xs text-muted-foreground">Fourth year</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Courses</CardTitle>
          <CardDescription>
            Search and filter courses by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>
            Complete list of academic courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Year/Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Instructors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm || departmentFilter !== 'all' || programFilter !== 'all' || yearFilter !== 'all' || semesterFilter !== 'all'
                        ? 'No courses found matching your criteria.'
                        : 'No courses found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.name}</div>
                          {course.description && (
                            <div className="text-sm text-muted-foreground">
                              {course.description.length > 50
                                ? `${course.description.substring(0, 50)}...`
                                : course.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.department.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.program.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">Year {course.year_level}</Badge>
                          <Badge variant="outline">Sem {course.semester}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{course.credit_hours}h</Badge>
                      </TableCell>
                      <TableCell>{course.total_students}</TableCell>
                      <TableCell>
                        {course.instructors.length > 0 ? (
                          <div className="text-sm">
                            {course.instructors.slice(0, 2).map(instructor => (
                              <div key={instructor.id}>{instructor.full_name}</div>
                            ))}
                            {course.instructors.length > 2 && (
                              <div className="text-muted-foreground">
                                +{course.instructors.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No instructors</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
