'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Settings, Shield, Bell, Database, Mail, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    institutionName: 'National Polytechnic Institute of PNG',
    institutionCode: 'NPI-PNG',
    academicYearStart: '2',
    semesterDuration: '16',
    minPassingGrade: '50',
    maxGPA: '4.0',
    enableNotifications: true,
    enableEmailAlerts: true,
    enableSMSAlerts: false,
    systemTimezone: 'Pacific/Port_Moresby',
    systemLanguage: 'en',
    maintenanceMode: false,
    backupFrequency: 'daily',
    passwordPolicy: 'standard'
  })

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings:`, settings)
  }

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Institution Information</span>
              </CardTitle>
              <CardDescription>Basic institution details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institution-name">Institution Name</Label>
                  <Input
                    id="institution-name"
                    value={settings.institutionName}
                    onChange={(e) => handleSettingChange('institutionName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="institution-code">Institution Code</Label>
                  <Input
                    id="institution-code"
                    value={settings.institutionCode}
                    onChange={(e) => handleSettingChange('institutionCode', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="institution-description">Description</Label>
                <Textarea
                  id="institution-description"
                  placeholder="Brief description of the institution"
                  defaultValue="Technical and Vocational Education Training System"
                />
              </div>
              <Button onClick={() => handleSave('general')}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Configuration</CardTitle>
              <CardDescription>Academic year, grading, and assessment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academic-year-start">Academic Year Start Month</Label>
                  <Select value={settings.academicYearStart} onValueChange={(value) => handleSettingChange('academicYearStart', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="2">February</SelectItem>
                      <SelectItem value="3">March</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="semester-duration">Semester Duration (weeks)</Label>
                  <Input
                    id="semester-duration"
                    value={settings.semesterDuration}
                    onChange={(e) => handleSettingChange('semesterDuration', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-passing-grade">Minimum Passing Grade (%)</Label>
                  <Input
                    id="min-passing-grade"
                    value={settings.minPassingGrade}
                    onChange={(e) => handleSettingChange('minPassingGrade', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="max-gpa">Maximum GPA Scale</Label>
                  <Input
                    id="max-gpa"
                    value={settings.maxGPA}
                    onChange={(e) => handleSettingChange('maxGPA', e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('academic')}>Save Academic Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>Configure how users receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-notifications">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Allow system to send notifications</p>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-email-alerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    id="enable-email-alerts"
                    checked={settings.enableEmailAlerts}
                    onCheckedChange={(checked) => handleSettingChange('enableEmailAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-sms-alerts">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    id="enable-sms-alerts"
                    checked={settings.enableSMSAlerts}
                    onCheckedChange={(checked) => handleSettingChange('enableSMSAlerts', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('notifications')}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" placeholder="30" />
                </div>

                <div>
                  <Label htmlFor="password-policy">Password Policy</Label>
                  <Select value={settings.passwordPolicy} onValueChange={(value) => handleSettingChange('passwordPolicy', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select password policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="standard">Standard (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="strong">Strong (8+ chars, mixed case, numbers, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin users</p>
                  </div>
                  <Switch id="two-factor" />
                </div>
              </div>

              <Button onClick={() => handleSave('security')}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Configuration</span>
              </CardTitle>
              <CardDescription>System-level settings and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="system-timezone">System Timezone</Label>
                  <Select value={settings.systemTimezone} onValueChange={(value) => handleSettingChange('systemTimezone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pacific/Port_Moresby">Port Moresby (GMT+10)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (GMT+10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable system access</p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => handleSave('system')}>Save System Settings</Button>
                <Button variant="outline">Run System Check</Button>
                <Button variant="outline">Create Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
