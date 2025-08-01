'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { BarChart, Download, FileText, PieChart, TrendingUp, Users } from 'lucide-react'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')

  const reportTypes = [
    { id: 'student-performance', name: 'Student Performance Report', icon: TrendingUp },
    { id: 'department-summary', name: 'Department Summary', icon: PieChart },
    { id: 'enrollment-stats', name: 'Enrollment Statistics', icon: Users },
    { id: 'grade-distribution', name: 'Grade Distribution', icon: BarChart },
    { id: 'course-completion', name: 'Course Completion Report', icon: FileText },
    { id: 'attendance-report', name: 'Attendance Report', icon: Users }
  ]

  const sampleStats = {
    totalStudents: 164,
    totalCourses: 39,
    averageGrade: 3.2,
    completionRate: 87
  }

  const handleGenerateReport = () => {
    console.log('Generating report:', selectedReport, 'for period:', selectedPeriod)
  }

  const handleDownloadReport = (format: string) => {
    console.log('Downloading report in format:', format)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+12% from last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Across 3 departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleStats.averageGrade}</div>
            <p className="text-xs text-muted-foreground">+0.2 from last semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">+5% improvement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Create detailed reports for analysis and record keeping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period">Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-semester">Current Semester</SelectItem>
                    <SelectItem value="last-semester">Last Semester</SelectItem>
                    <SelectItem value="current-year">Current Academic Year</SelectItem>
                    <SelectItem value="last-year">Last Academic Year</SelectItem>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedReport || !selectedPeriod}
                  className="flex-1"
                >
                  Generate Report
                </Button>
              </div>

              {selectedReport && selectedPeriod && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Download Options</h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport('pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport('excel')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport('csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
              <CardDescription>Commonly used reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportTypes.map((report) => {
                const IconComponent = report.icon
                return (
                  <Button
                    key={report.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedReport(report.id)
                      setSelectedPeriod('current-semester')
                    }}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {report.name}
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Student Performance Report - Semester 1 2024</p>
                <p className="text-sm text-muted-foreground">Generated on Jan 15, 2024</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Department Summary - 2023 Academic Year</p>
                <p className="text-sm text-muted-foreground">Generated on Dec 20, 2023</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Enrollment Statistics - Q4 2023</p>
                <p className="text-sm text-muted-foreground">Generated on Oct 30, 2023</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
