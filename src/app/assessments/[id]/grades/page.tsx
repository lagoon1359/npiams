'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftIcon, SaveIcon, CheckIcon, XIcon, UploadIcon, DownloadIcon, AlertTriangleIcon, AlertCircleIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { assessmentService, type StudentGradeWithDetails, type Assessment } from '@/lib/services/assessments'
import { useAuth } from '@/contexts/AuthContext'

const GradesEntryPage = () => {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [studentGrades, setStudentGrades] = useState<StudentGradeWithDetails[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'pending'>('all')
  const [isModerateDialogOpen, setIsModerateDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentGradeWithDetails | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  // Load assessment and student grades data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load assessment details
        const { data: assessmentData, error: assessmentError } = await assessmentService.getAssessments({})

        if (assessmentError) throw assessmentError

        const currentAssessment = assessmentData?.find(a => a.id === assessmentId)
        if (!currentAssessment) {
          throw new Error('Assessment not found')
        }

        setAssessment(currentAssessment)

        // Load student grades for this assessment
        const { data: gradesData, error: gradesError } = await assessmentService.getStudentGrades(assessmentId)

        if (gradesError) throw gradesError

        setStudentGrades(gradesData || [])

      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (assessmentId) {
      loadData()
    }
  }, [assessmentId])

  const filteredStudents = studentGrades.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'graded' && student.is_graded) ||
                         (filterStatus === 'pending' && !student.is_graded)

    return matchesSearch && matchesFilter
  })

  const updateScore = (studentId: string, score: number | null) => {
    setStudentGrades(prev => prev.map(student =>
      student.id === studentId
        ? { ...student, score, is_graded: score !== null }
        : student
    ))
  }

  const updateComments = (studentId: string, comments: string) => {
    setStudentGrades(prev => prev.map(student =>
      student.id === studentId
        ? { ...student, comments }
        : student
    ))
  }

  const saveGrades = async () => {
    try {
      setIsSaving(true)
      setError(null)

      if (!user) {
        setError('User not authenticated')
        return
      }

      // Prepare updates for changed grades
      const gradesToUpdate = studentGrades
        .filter(grade => grade.score !== null || grade.comments.trim() !== '')
        .map(grade => ({
          grade_id: grade.id,
          score: grade.score,
          comments: grade.comments,
          graded_by: user.id
        }))

      if (gradesToUpdate.length === 0) {
        setError('No grades to save')
        return
      }

      const { error: saveError } = await assessmentService.bulkUpdateGrades(gradesToUpdate)

      if (saveError) {
        setError(saveError.message)
        return
      }

      // Reload the data to get fresh stats
      const { data: updatedGrades } = await assessmentService.getStudentGrades(assessmentId)
      if (updatedGrades) {
        setStudentGrades(updatedGrades)
      }

    } catch (err) {
      console.error('Error saving grades:', err)
      setError(err instanceof Error ? err.message : 'Failed to save grades')
    } finally {
      setIsSaving(false)
    }
  }

  // CSV Import functionality
  const handleCSVImport = async () => {
    if (!csvFile || !user) return

    try {
      setError(null)
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())

      const csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const row: any = {}
        headers.forEach((header, index) => {
          row[header.toLowerCase().replace(/\s+/g, '_')] = values[index]
        })
        return {
          student_number: row.student_number || row.student_id,
          score: parseFloat(row.score || '0'),
          comments: row.comments || ''
        }
      }).filter(row => row.student_number && !isNaN(row.score))

      const result = await assessmentService.importGradesFromCSV(assessmentId, csvData, user.id)
      setImportResult(result)

      if (result.success || result.imported_count > 0) {
        // Reload grades
        const { data: updatedGrades } = await assessmentService.getStudentGrades(assessmentId)
        if (updatedGrades) {
          setStudentGrades(updatedGrades)
        }
      }

    } catch (err) {
      console.error('Error importing CSV:', err)
      setError(err instanceof Error ? err.message : 'Failed to import CSV')
    }
  }

  // CSV Export functionality
  const handleCSVExport = async () => {
    try {
      const { data: csvData, error: exportError } = await assessmentService.exportGradesToCSV(assessmentId)

      if (exportError) {
        setError(exportError.message)
        return
      }

      if (!csvData || csvData.length === 0) {
        setError('No data to export')
        return
      }

      // Convert to CSV string
      const headers = Object.keys(csvData[0])
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any) => headers.map(header => row[header]).join(','))
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${assessment?.name || 'assessment'}_grades.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error('Error exporting CSV:', err)
      setError(err instanceof Error ? err.message : 'Failed to export CSV')
    }
  }

  const getScoreColor = (score: number | null, maxScore: number) => {
    if (score === null) return 'text-gray-500'
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateStats = () => {
    const gradedStudents = studentGrades.filter(s => s.is_graded && s.score !== null)
    const scores = gradedStudents.map(s => s.score!).filter(s => s !== null)

    if (scores.length === 0) return { average: 0, highest: 0, lowest: 0, passed: 0 }

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)
    const passed = scores.filter(score => (score / (assessment?.max_score || 100)) * 100 >= 50).length

    return { average, highest, lowest, passed }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessment and grades...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Assessment Not Found</h2>
            <p className="text-red-600 mb-4">The requested assessment could not be found.</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{assessment.name}</h1>
          <p className="text-gray-600">{assessment.course?.code} - {assessment.course?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCSVExport}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export Grades
          </Button>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UploadIcon className="w-4 h-4 mr-2" />
                Import Grades
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Grades from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with columns: student_number, score, comments
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                </div>
                {importResult && (
                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-medium mb-2">Import Results:</h4>
                    <p>✅ Imported: {importResult.imported_count}</p>
                    <p>❌ Failed: {importResult.failed_count}</p>
                    {importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-red-600 font-medium">Errors:</p>
                        <ul className="text-sm text-red-600">
                          {importResult.errors.map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCSVImport} disabled={!csvFile}>
                    Import
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={saveGrades} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            <SaveIcon className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Grades'}
          </Button>
        </div>
      </div>

      {/* Assessment Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-sm text-gray-600">Due Date</Label>
              <p className="font-medium">{new Date(assessment.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Max Score</Label>
              <p className="font-medium">{assessment.max_score} points</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Weight</Label>
              <p className="font-medium">{assessment.weight_percentage}%</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Progress</Label>
              <p className="font-medium">{assessment.graded_count}/{assessment.total_students} graded</p>
            </div>
          </div>
          {assessment.description && (
            <div className="mt-4">
              <Label className="text-sm text-gray-600">Description</Label>
              <p className="text-gray-800">{assessment.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.average.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
              <p className="text-sm text-gray-600">Highest Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
              <p className="text-sm text-gray-600">Lowest Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.passed}</p>
              <p className="text-sm text-gray-600">Students Passed</p>
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>Enter and manage grades for this assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{student.student_name}</p>
                      <p className="text-sm text-gray-500">{student.student_number}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.submitted_date ? (
                      <div>
                        <p className="text-sm">{new Date(student.submitted_date).toLocaleDateString()}</p>
                        {student.is_late && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangleIcon className="w-3 h-3 mr-1" />
                            Late
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary">Not Submitted</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={assessment.max_score}
                      value={student.score || ''}
                      onChange={(e) => updateScore(student.id, e.target.value ? Number(e.target.value) : null)}
                      className="w-20"
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    {student.score !== null && (
                      <div className="text-center">
                        <p className={cn("font-medium", getScoreColor(student.score, assessment.max_score))}>
                          {((student.score / assessment.max_score) * 100).toFixed(1)}%
                        </p>
                        <Badge className={cn(
                          "text-xs",
                          ((student.score / assessment.max_score) * 100) >= 50
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}>
                          {((student.score / assessment.max_score) * 100) >= 50 ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={student.comments}
                      onChange={(e) => updateComments(student.id, e.target.value)}
                      placeholder="Add comments..."
                      className="min-h-[60px] text-sm"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell>
                    {student.is_graded ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        Graded
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XIcon className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudent(student)}
                        >
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Student Grade Details</DialogTitle>
                          <DialogDescription>
                            View and edit detailed information for {student.student_name}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedStudent && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Student Name</Label>
                                <p className="font-medium">{selectedStudent.student_name}</p>
                              </div>
                              <div>
                                <Label>Student Number</Label>
                                <p className="font-medium">{selectedStudent.student_number}</p>
                              </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Score</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max={assessment.max_score}
                                  value={selectedStudent.score || ''}
                                  onChange={(e) => {
                                    const newScore = e.target.value ? Number(e.target.value) : null
                                    setSelectedStudent({...selectedStudent, score: newScore})
                                    updateScore(selectedStudent.id, newScore)
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Percentage</Label>
                                <p className="p-2 bg-gray-50 rounded">
                                  {selectedStudent.score ? ((selectedStudent.score / assessment.max_score) * 100).toFixed(1) : '0'}%
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label>Comments</Label>
                              <Textarea
                                value={selectedStudent.comments}
                                onChange={(e) => {
                                  setSelectedStudent({...selectedStudent, comments: e.target.value})
                                  updateComments(selectedStudent.id, e.target.value)
                                }}
                                placeholder="Add detailed feedback..."
                                rows={4}
                              />
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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

export default GradesEntryPage
