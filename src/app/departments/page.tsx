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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Search,
  Plus,
  Edit,
  Users,
  BookOpen,
  UserCheck
} from 'lucide-react'
import { DepartmentService, type DepartmentWithDetails, type CreateDepartmentData } from '@/lib/services/departments'
import type { User } from '@/lib/supabase'

export default function DepartmentsPage() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState<DepartmentWithDetails[]>([])
  const [eligibleHeads, setEligibleHeads] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateDepartmentData>({
    name: '',
    code: '',
    description: '',
    head_id: ''
  })

  // Load data
  useEffect(() => {
    loadDepartments()
    loadEligibleHeads()
  }, [])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      const data = await DepartmentService.getAllDepartments()
      setDepartments(data)
    } catch (error: any) {
      console.error('Error loading departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEligibleHeads = async () => {
    try {
      const data = await DepartmentService.getEligibleDepartmentHeads()
      setEligibleHeads(data)
    } catch (error: any) {
      console.error('Error loading eligible heads:', error)
    }
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.code) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await DepartmentService.createDepartment({
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        head_id: formData.head_id || undefined
      })

      // Reset form and close dialog
      setFormData({ name: '', code: '', description: '', head_id: '' })
      setIsCreateDialogOpen(false)

      // Reload departments
      await loadDepartments()

      alert('Department created successfully!')
    } catch (error: any) {
      console.error('Error creating department:', error)
      alert(`Failed to create department: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading departments...</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user can manage departments
  const canManageDepartments = user?.role === 'admin'

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Departments
          </h1>
          <p className="text-gray-600 mt-2">Manage academic departments and their leadership</p>
        </div>
        {canManageDepartments && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Department
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
                <DialogDescription>
                  Add a new academic department to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Department Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Department Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., CS"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the department"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="head">Department Head</Label>
                  <Select
                    value={formData.head_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, head_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department head (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleHeads.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.full_name} ({person.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Department'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.total_courses, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.total_staff, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Academic staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Heads</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.filter(dept => dept.head).length}
            </div>
            <p className="text-xs text-muted-foreground">Have department heads</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Departments</CardTitle>
          <CardDescription>
            Find departments by name, code, or department head
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments ({filteredDepartments.length})</CardTitle>
          <CardDescription>
            Complete list of academic departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Students</TableHead>
                  {canManageDepartments && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageDepartments ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No departments found matching your search criteria.' : 'No departments found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{department.name}</div>
                          {department.description && (
                            <div className="text-sm text-muted-foreground">
                              {department.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{department.code}</Badge>
                      </TableCell>
                      <TableCell>
                        {department.head ? (
                          <div>
                            <div className="font-medium">{department.head.full_name}</div>
                            <div className="text-sm text-muted-foreground">{department.head.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No head assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{department.total_courses}</TableCell>
                      <TableCell>{department.total_staff}</TableCell>
                      <TableCell>{department.total_students}</TableCell>
                      {canManageDepartments && (
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
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
