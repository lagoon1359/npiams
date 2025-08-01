'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, Edit, Trash2, Users, BookOpen, Building, Loader2 } from 'lucide-react'
import type { Department, User } from '@/lib/supabase'

interface DepartmentWithStats extends Department {
  totalPrograms: number
  totalStudents: number
  totalInstructors: number
  headName?: string
}

export default function DepartmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([])
  const [availableHeads, setAvailableHeads] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<DepartmentWithStats | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head_id: '',
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDepartments()
      fetchAvailableHeads()
    }
  }, [user])

  const fetchDepartments = async () => {
    // Simulated data - replace with actual Supabase calls
    setDepartments([
      {
        id: '1',
        name: 'Engineering Department',
        code: 'ENG',
        description: 'Faculty of Engineering and Technology',
        head_id: '101',
        headName: 'Dr. Mary Engineering',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        totalPrograms: 3,
        totalStudents: 385,
        totalInstructors: 12,
      },
      {
        id: '2',
        name: 'Business Department',
        code: 'BUS',
        description: 'Faculty of Business and Commerce',
        head_id: '102',
        headName: 'Prof. Peter Business',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        totalPrograms: 2,
        totalStudents: 245,
        totalInstructors: 8,
      },
      {
        id: '3',
        name: 'Sciences Department',
        code: 'SCI',
        description: 'Faculty of Applied Sciences',
        head_id: '103',
        headName: 'Dr. Sarah Sciences',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        totalPrograms: 2,
        totalStudents: 198,
        totalInstructors: 6,
      },
    ])
    setLoading(false)
  }

  const fetchAvailableHeads = async () => {
    // Simulated data - replace with actual Supabase calls
    setAvailableHeads([
      {
        id: '101',
        email: 'mary.eng@npi.pg',
        full_name: 'Dr. Mary Engineering',
        role: 'department_head',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '102',
        email: 'peter.bus@npi.pg',
        full_name: 'Prof. Peter Business',
        role: 'department_head',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '103',
        email: 'sarah.sci@npi.pg',
        full_name: 'Dr. Sarah Sciences',
        role: 'department_head',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '104',
        email: 'new.head@npi.pg',
        full_name: 'Dr. Available Head',
        role: 'department_head',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ])
  }

  const handleCreateDepartment = () => {
    setEditingDepartment(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      head_id: '',
    })
    setDialogOpen(true)
  }

  const handleEditDepartment = (department: DepartmentWithStats) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      head_id: department.head_id || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate API call
    if (editingDepartment) {
      // Update existing department
      console.log('Updating department:', formData)
    } else {
      // Create new department
      console.log('Creating department:', formData)
    }

    setDialogOpen(false)
    // Refresh departments list
    await fetchDepartments()
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      console.log('Deleting department:', departmentId)
      // Simulate API call
      await fetchDepartments()
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600 mt-2">Manage academic departments and their heads</p>
        </div>
        <Button onClick={handleCreateDepartment}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.totalPrograms, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.totalStudents, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.totalInstructors, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            Overview of all academic departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department Head</TableHead>
                <TableHead>Programs</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Instructors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{department.name}</div>
                      <div className="text-sm text-gray-500">{department.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{department.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {department.headName || 'Not assigned'}
                  </TableCell>
                  <TableCell>{department.totalPrograms}</TableCell>
                  <TableCell>{department.totalStudents}</TableCell>
                  <TableCell>{department.totalInstructors}</TableCell>
                  <TableCell>
                    <Badge
                      variant={department.is_active ? "default" : "secondary"}
                    >
                      {department.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDepartment(department)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDepartment(department.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Department Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Create Department'}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? 'Update the department information below.'
                : 'Add a new academic department to the system.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Engineering Department"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Department Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., ENG"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department description..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="head_id">Department Head</Label>
                <Select
                  value={formData.head_id}
                  onValueChange={(value) => setFormData({ ...formData, head_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No department head</SelectItem>
                    {availableHeads.map((head) => (
                      <SelectItem key={head.id} value={head.id}>
                        {head.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDepartment ? 'Update' : 'Create'} Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
