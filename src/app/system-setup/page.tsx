'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Settings,
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  CheckCircle,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { DepartmentService, type CreateDepartmentData } from '@/lib/services/departments'
import { UserService, type CreateUserData } from '@/lib/services/users'
import { ProgramService, type CreateProgramData } from '@/lib/services/programs'
import { CourseService, type CreateCourseData } from '@/lib/services/courses'
import type { UserRole, Department, User, Program } from '@/lib/supabase'

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
}

export default function SystemSetupPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'departments',
      title: 'Setup Academic Departments',
      description: 'Create departments like Engineering, Business, IT, Applied Sciences',
      completed: false,
      required: true
    },
    {
      id: 'programs',
      title: 'Setup Academic Programs',
      description: 'Create degree programs and certificates offered by each department',
      completed: false,
      required: true
    },
    {
      id: 'staff',
      title: 'Setup Academic Staff',
      description: 'Add instructors, tutors, and department heads',
      completed: false,
      required: true
    },
    {
      id: 'courses',
      title: 'Setup Courses',
      description: 'Create courses for each program with proper year/semester structure',
      completed: false,
      required: true
    }
  ])

  // State for data
  const [departments, setDepartments] = useState<Department[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [staff, setStaff] = useState<User[]>([])
  const [availableHeads, setAvailableHeads] = useState<User[]>([])

  // Dialog states
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false)
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false)
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false)
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [deptForm, setDeptForm] = useState<CreateDepartmentData>({
    name: '',
    code: '',
    description: '',
    head_id: ''
  })

  const [programForm, setProgramForm] = useState<CreateProgramData>({
    name: '',
    code: '',
    department_id: '',
    duration_years: 3,
    description: ''
  })

  const [staffForm, setStaffForm] = useState<CreateUserData>({
    email: '',
    full_name: '',
    role: 'instructor',
    department: '',
    phone: ''
  })

  const [courseForm, setCourseForm] = useState<CreateCourseData>({
    name: '',
    code: '',
    description: '',
    department_id: '',
    program_id: '',
    year_level: 1,
    semester: '1',
    credit_hours: 3
  })

  useEffect(() => {
    loadSetupData()
  }, [])

  const loadSetupData = async () => {
    try {
      setLoading(true)
      const [deptData, staffData, programData] = await Promise.all([
        DepartmentService.getAllDepartments(),
        UserService.getAllUsers({ is_active: true }),
        ProgramService.getAllPrograms({ is_active: true })
      ])

      setDepartments(deptData)
      setStaff(staffData)
      setPrograms(programData)
      setAvailableHeads(staffData.filter(s => ['instructor', 'admin'].includes(s.role)))

      // Update setup steps completion
      updateSetupStepsCompletion(deptData, programData, staffData)
    } catch (error: any) {
      console.error('Error loading setup data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetupStepsCompletion = (depts: Department[], progs: Program[], staffList: User[]) => {
    setSetupSteps(prev => prev.map(step => {
      switch (step.id) {
        case 'departments':
          return { ...step, completed: depts.length > 0 }
        case 'programs':
          return { ...step, completed: progs.length > 0 }
        case 'staff':
          return { ...step, completed: staffList.filter(s => s.role !== 'admin').length > 0 }
        case 'courses':
          return { ...step, completed: false } // We'll check this separately
        default:
          return step
      }
    }))
  }

  // Create Department
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptForm.name || !deptForm.code) {
      alert('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await DepartmentService.createDepartment({
        ...deptForm,
        head_id: deptForm.head_id || undefined
      })

      setDeptForm({ name: '', code: '', description: '', head_id: '' })
      setIsDeptDialogOpen(false)
      await loadSetupData()
      alert('Department created successfully!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create Program
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!programForm.name || !programForm.code || !programForm.department_id) {
      alert('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await ProgramService.createProgram(programForm)

      setProgramForm({ name: '', code: '', department_id: '', duration_years: 3, description: '' })
      setIsProgramDialogOpen(false)
      await loadSetupData()
      alert('Program created successfully!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffForm.email || !staffForm.full_name || !staffForm.role) {
      alert('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await UserService.createUser({
        ...staffForm,
        department: staffForm.department || undefined
      })

      setStaffForm({ email: '', full_name: '', role: 'instructor', department: '', phone: '' })
      setIsStaffDialogOpen(false)
      await loadSetupData()
      alert('Staff member created successfully!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseForm.name || !courseForm.code || !courseForm.department_id || !courseForm.program_id) {
      alert('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await CourseService.createCourse(courseForm)

      setCourseForm({
        name: '',
        code: '',
        description: '',
        department_id: '',
        program_id: '',
        year_level: 1,
        semester: '1',
        credit_hours: 3
      })
      setIsCourseDialogOpen(false)
      alert('Course created successfully!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user?.role !== 'admin' && user?.role !== 'department_head') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You need admin or department head privileges to access system setup.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading system setup...</p>
          </div>
        </div>
      </div>
    )
  }

  const completedSteps = setupSteps.filter(step => step.completed).length
  const totalSteps = setupSteps.length

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            TVET Institution System Setup
          </h1>
          <p className="text-gray-600 mt-2">
            Configure your Technical and Vocational Education institution structure
          </p>
        </div>
        <Badge variant={completedSteps === totalSteps ? "default" : "secondary"} className="text-lg px-4 py-2">
          {completedSteps}/{totalSteps} Steps Complete
        </Badge>
      </div>

      {/* Setup Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>
            Complete these steps to configure your TVET institution management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {setupSteps.map((step) => (
              <div
                key={step.id}
                className={`p-4 border rounded-lg ${
                  step.completed ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  <h3 className="font-medium text-sm">{step.title}</h3>
                </div>
                <p className="text-xs text-gray-600">{step.description}</p>
                {step.required && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Required
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Programs
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Departments</CardTitle>
                <CardDescription>
                  Create departments like Engineering, Business, Information Technology, Applied Sciences
                </CardDescription>
              </div>
              <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Department</DialogTitle>
                    <DialogDescription>
                      Add a new academic department to your TVET institution
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dept_name">Department Name *</Label>
                        <Input
                          id="dept_name"
                          value={deptForm.name}
                          onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., School of Engineering"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dept_code">Department Code *</Label>
                        <Input
                          id="dept_code"
                          value={deptForm.code}
                          onChange={(e) => setDeptForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="e.g., ENG"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="dept_desc">Description</Label>
                      <Textarea
                        id="dept_desc"
                        value={deptForm.description}
                        onChange={(e) => setDeptForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the department"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dept_head">Department Head</Label>
                      <Select
                        value={deptForm.head_id}
                        onValueChange={(value) => setDeptForm(prev => ({ ...prev, head_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department head (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHeads.map((head) => (
                            <SelectItem key={head.id} value={head.id}>
                              {head.full_name} ({head.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDeptDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Department'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No departments created yet. Add your first department to get started.</p>
                  </div>
                ) : (
                  departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {dept.code}</p>
                        {dept.description && (
                          <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {dept.head_id ? (
                          <Badge variant="default">Has Head</Badge>
                        ) : (
                          <Badge variant="outline">No Head Assigned</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Programs</CardTitle>
                <CardDescription>
                  Create degree programs, diplomas, and certificates offered by each department
                </CardDescription>
              </div>
              <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={departments.length === 0}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Program
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Program</DialogTitle>
                    <DialogDescription>
                      Add an academic program to a department
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProgram} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prog_name">Program Name *</Label>
                        <Input
                          id="prog_name"
                          value={programForm.name}
                          onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Bachelor of Engineering"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="prog_code">Program Code *</Label>
                        <Input
                          id="prog_code"
                          value={programForm.code}
                          onChange={(e) => setProgramForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="e.g., BE"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prog_dept">Department *</Label>
                        <Select
                          value={programForm.department_id}
                          onValueChange={(value) => setProgramForm(prev => ({ ...prev, department_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="prog_duration">Duration (Years) *</Label>
                        <Select
                          value={programForm.duration_years.toString()}
                          onValueChange={(value) => setProgramForm(prev => ({ ...prev, duration_years: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year (Certificate)</SelectItem>
                            <SelectItem value="2">2 Years (Diploma)</SelectItem>
                            <SelectItem value="3">3 Years (Degree)</SelectItem>
                            <SelectItem value="4">4 Years (Honours)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="prog_desc">Description</Label>
                      <Textarea
                        id="prog_desc"
                        value={programForm.description}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the program"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsProgramDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Program'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Please create departments first before adding programs.</p>
                  </div>
                ) : programs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No programs created yet. Add your first program to get started.</p>
                  </div>
                ) : (
                  programs.map((program) => (
                    <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{program.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Code: {program.code} • Duration: {program.duration_years} years
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Department: {program.department.name}
                        </p>
                      </div>
                      <Badge variant="outline">{program.duration_years} Years</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Staff</CardTitle>
                <CardDescription>
                  Add instructors, tutors, and department heads to your institution
                </CardDescription>
              </div>
              <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                      Add an instructor, tutor, or department head
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateStaff} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="staff_name">Full Name *</Label>
                        <Input
                          id="staff_name"
                          value={staffForm.full_name}
                          onChange={(e) => setStaffForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="e.g., Dr. John Smith"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="staff_email">Email *</Label>
                        <Input
                          id="staff_email"
                          type="email"
                          value={staffForm.email}
                          onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="e.g., john.smith@npi.edu.pg"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="staff_role">Role *</Label>
                        <Select
                          value={staffForm.role}
                          onValueChange={(value) => setStaffForm(prev => ({ ...prev, role: value as UserRole }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="tutor">Tutor</SelectItem>
                            <SelectItem value="department_head">Department Head</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="staff_dept">Department</Label>
                        <Select
                          value={staffForm.department}
                          onValueChange={(value) => setStaffForm(prev => ({ ...prev, department: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="staff_phone">Phone</Label>
                      <Input
                        id="staff_phone"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g., +675-123-4567"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsStaffDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Staff'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staff.filter(s => s.role !== 'admin').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No staff members added yet. Add your first staff member to get started.</p>
                  </div>
                ) : (
                  staff.filter(s => s.role !== 'admin').map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{member.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Department: {member.department_name || 'Unassigned'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={
                          member.role === 'department_head' ? 'default' :
                          member.role === 'instructor' ? 'secondary' : 'outline'
                        }>
                          {member.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {member.is_active ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-xs">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">Inactive</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>
                  Create courses for each program with proper year and semester structure
                </CardDescription>
              </div>
              <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={programs.length === 0}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                      Add a course to an academic program
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="course_name">Course Name *</Label>
                        <Input
                          id="course_name"
                          value={courseForm.name}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Engineering Mathematics I"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="course_code">Course Code *</Label>
                        <Input
                          id="course_code"
                          value={courseForm.code}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="e.g., ENG101"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="course_dept">Department *</Label>
                        <Select
                          value={courseForm.department_id}
                          onValueChange={(value) => {
                            setCourseForm(prev => ({ ...prev, department_id: value, program_id: '' }))
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="course_program">Program *</Label>
                        <Select
                          value={courseForm.program_id}
                          onValueChange={(value) => setCourseForm(prev => ({ ...prev, program_id: value }))}
                          disabled={!courseForm.department_id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            {programs
                              .filter(p => p.department_id === courseForm.department_id)
                              .map((program) => (
                              <SelectItem key={program.id} value={program.id}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="course_year">Year Level *</Label>
                        <Select
                          value={courseForm.year_level.toString()}
                          onValueChange={(value) => setCourseForm(prev => ({ ...prev, year_level: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Year 1</SelectItem>
                            <SelectItem value="2">Year 2</SelectItem>
                            <SelectItem value="3">Year 3</SelectItem>
                            <SelectItem value="4">Year 4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="course_semester">Semester *</Label>
                        <Select
                          value={courseForm.semester}
                          onValueChange={(value) => setCourseForm(prev => ({ ...prev, semester: value as '1' | '2' }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Semester 1</SelectItem>
                            <SelectItem value="2">Semester 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="course_credits">Credit Hours *</Label>
                        <Input
                          id="course_credits"
                          type="number"
                          min="1"
                          max="6"
                          value={courseForm.credit_hours}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, credit_hours: parseInt(e.target.value) }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="course_desc">Description</Label>
                      <Textarea
                        id="course_desc"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the course"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCourseDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Course'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {programs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Please create departments and programs first before adding courses.</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Ready to create courses. Click "Add Course" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
