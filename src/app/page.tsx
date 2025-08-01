'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  const quickActions = [
    {
      title: 'Course Management',
      description: 'Create and manage academic courses',
      href: '/courses',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Programs',
      description: 'Manage academic programs and curricula',
      href: '/programs',
      icon: GraduationCap,
      color: 'bg-purple-500'
    },
    {
      title: 'Assessments',
      description: 'Create and manage student assessments',
      href: '/assessments',
      icon: ClipboardList,
      color: 'bg-red-500'
    },
    {
      title: 'Grades',
      description: 'View and manage student grades',
      href: '/student-grades',
      icon: FileText,
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <GraduationCap className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Academic Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Comprehensive academic management platform for courses, programs, assessments, and grades
            </p>
            {user ? (
              <div className="text-lg text-gray-700 mb-4">
                Welcome back, <span className="font-semibold">{user.full_name}</span>!
              </div>
            ) : (
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/courses">
                    <BookOpen className="mr-2 h-5 w-5" />
                    View Courses
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <p className="text-lg text-gray-600">Access core academic management functions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {action.description}
                      </CardDescription>
                      <div className="flex items-center text-primary font-medium">
                        <span>Access</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-lg text-gray-600">Everything you need for academic management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Course Management
                  </h3>
                  <p className="text-gray-600">
                    Create and manage courses, set prerequisites, organize curriculum,
                    and track academic content delivery across departments.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Program Administration
                  </h3>
                  <p className="text-gray-600">
                    Design academic programs, set graduation requirements,
                    manage curricula, and track program effectiveness.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Assessment Tools
                  </h3>
                  <p className="text-gray-600">
                    Create various types of assessments, manage evaluation
                    criteria, and track academic performance across courses.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Grade Management
                  </h3>
                  <p className="text-gray-600">
                    Record grades, calculate GPAs, generate academic reports,
                    and manage grading workflows for instructors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Streamline Academic Operations
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Manage your institution's academic programs efficiently and effectively
            </p>
            {!user && (
              <div className="space-x-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/courses">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Explore Courses
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                  <Link href="/login">
                    Access System
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
