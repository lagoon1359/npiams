'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Program {
  id: string
  name: string
  code: string
  department_id: string
  department_name: string
  duration_years: number
  description: string
  is_active: boolean
  total_students: number
  total_courses: number
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Sample data
  useEffect(() => {
    const samplePrograms: Program[] = [
      {
        id: '1',
        name: 'Diploma in Civil Engineering',
        code: 'DCE',
        department_id: '1',
        department_name: 'Engineering Department',
        duration_years: 3,
        description: 'Three-year diploma program in civil engineering',
        is_active: true,
        total_students: 45,
        total_courses: 12
      },
      {
        id: '2',
        name: 'Diploma in Electrical Engineering',
        code: 'DEE',
        department_id: '1',
        department_name: 'Engineering Department',
        duration_years: 3,
        description: 'Three-year diploma program in electrical engineering',
        is_active: true,
        total_students: 38,
        total_courses: 10
      },
      {
        id: '3',
        name: 'Diploma in Business Management',
        code: 'DBM',
        department_id: '2',
        department_name: 'Business Department',
        duration_years: 2,
        description: 'Two-year diploma program in business management',
        is_active: true,
        total_students: 52,
        total_courses: 8
      },
      {
        id: '4',
        name: 'Diploma in Applied Sciences',
        code: 'DAS',
        department_id: '3',
        department_name: 'Sciences Department',
        duration_years: 2,
        description: 'Two-year diploma program in applied sciences',
        is_active: true,
        total_students: 29,
        total_courses: 9
      }
    ]
    setPrograms(samplePrograms)
    setLoading(false)
  }, [])

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddProgram = () => {
    // Add program logic here
    setIsAddDialogOpen(false)
  }

  const handleEditProgram = (programId: string) => {
    // Edit program logic here
    console.log('Edit program:', programId)
  }

  const handleDeleteProgram = (programId: string) => {
    // Delete program logic here
    console.log('Delete program:', programId)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Programs Management</h1>
          <p className="text-muted-foreground">Manage academic programs and curricula</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Program</DialogTitle>
              <DialogDescription>Create a new academic program</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="program-name">Program Name</Label>
                <Input id="program-name" placeholder="Enter program name" />
              </div>
              <div>
                <Label htmlFor="program-code">Program Code</Label>
                <Input id="program-code" placeholder="Enter program code" />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eng">Engineering Department</SelectItem>
                    <SelectItem value="bus">Business Department</SelectItem>
                    <SelectItem value="sci">Sciences Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (Years)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="4">4 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter program description" />
              </div>
              <Button onClick={handleAddProgram} className="w-full">Add Program</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.filter(p => p.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.reduce((sum, p) => sum + p.total_students, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.reduce((sum, p) => sum + p.total_courses, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programs</CardTitle>
          <CardDescription>Manage all academic programs</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 opacity-50" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{program.name}</div>
                      <div className="text-sm text-gray-500">{program.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{program.code}</Badge>
                  </TableCell>
                  <TableCell>{program.department_name}</TableCell>
                  <TableCell>{program.duration_years} Year{program.duration_years > 1 ? 's' : ''}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{program.total_students} Students</div>
                      <div className="text-gray-500">{program.total_courses} Courses</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={program.is_active ? "default" : "secondary"}>
                      {program.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProgram(program.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProgram(program.id)}
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
    </div>
  )
}
