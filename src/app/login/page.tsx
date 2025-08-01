'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await performLogin(email, password)
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    await performLogin(demoEmail, demoPassword)
  }

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true)
    setError('')
    setSuccess('')

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Login timeout. Please check your internet connection and try again.')
    }, 15000) // 15 second timeout

    try {
      const { error } = await signIn(loginEmail, loginPassword)

      clearTimeout(timeoutId)

      if (error) {
        if (error.includes('Invalid login credentials') || error.includes('Invalid email or password')) {
          if (loginEmail.includes('@npi.pg')) {
            setError(`Demo account "${loginEmail}" not found. Please create this account in your Supabase Dashboard → Authentication → Users first.`)
          } else {
            setError('Invalid email or password. Please check your credentials and try again.')
          }
        } else if (error.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else if (error.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.')
        } else {
          setError(error)
        }
        setLoading(false)
      } else {
        setSuccess('Login successful! Setting up your profile...')

        // Add another timeout for profile setup
        const profileTimeoutId = setTimeout(() => {
          setLoading(false)
          setError('Profile setup is taking longer than expected. Please refresh the page.')
        }, 10000) // 10 second timeout for profile setup

        // Wait a moment for auth context to update
        setTimeout(() => {
          clearTimeout(profileTimeoutId)
          if (!user) {
            // If user is still null after successful auth, something went wrong
            setLoading(false)
            setError('Authentication succeeded but profile setup failed. Please try logging in again.')
          } else {
            router.push('/dashboard')
          }
        }, 2000)
      }
    } catch (err) {
      clearTimeout(timeoutId)
      setError('An unexpected error occurred. Please check your internet connection and try again.')
      setLoading(false)
      console.error('Login error:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            NPI PNG Assessment System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            National Polytechnic Institute of PNG
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Demo Accounts
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDemoLogin('admin@npi.pg', 'admin123')}
                  disabled={loading}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Login as Admin</span>
                    <span className="text-xs text-gray-500">Full Access</span>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDemoLogin('instructor@npi.pg', 'instructor123')}
                  disabled={loading}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Login as Instructor</span>
                    <span className="text-xs text-gray-500">Teaching Access</span>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDemoLogin('student@npi.pg', 'student123')}
                  disabled={loading}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Login as Student</span>
                    <span className="text-xs text-gray-500">Student Portal</span>
                  </div>
                </Button>
              </div>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-800 font-medium mb-2">⚠️ Demo Setup Required:</p>
                <p className="text-xs text-red-700 mb-2">
                  The demo accounts must be created in your Supabase Dashboard first.
                </p>
                <ol className="text-xs text-red-600 space-y-1 ml-4 list-decimal">
                  <li>Go to Supabase Dashboard → Authentication → Users</li>
                  <li>Click "Invite" or "Add user"</li>
                  <li>Create each account with these credentials:</li>
                </ol>
                <div className="mt-2 text-xs text-red-600 space-y-1 ml-4">
                  <p>• <strong>Admin:</strong> admin@npi.pg / admin123</p>
                  <p>• <strong>Instructor:</strong> instructor@npi.pg / instructor123</p>
                  <p>• <strong>Student:</strong> student@npi.pg / student123</p>
                </div>
                <p className="text-xs text-red-700 mt-2">
                  ✅ Make sure to confirm each email address before testing login.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>© 2024 National Polytechnic Institute of PNG</p>
          <p>Technical and Vocational Education Training System</p>
        </div>
      </div>
    </div>
  )
}
