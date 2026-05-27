'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton } from '@/components/brutal'
import { LogoutButton } from '@/components/auth/logout-button'
import { cn } from '@/lib/utils'
import { resetOnboarding } from '@/lib/user/profile'
import { User, Bell, Shield, Palette, Save, Github, ExternalLink, RefreshCw } from 'lucide-react'

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    githubUsername: 'johndoe',
    targetRole: 'frontend-developer',
    currentLevel: 'intermediate',
    studyTime: '1hour',
  })

  const handleResetOnboarding = () => {
    resetOnboarding()
    setProfileForm((prev) => ({
      ...prev,
      targetRole: 'frontend-developer',
      currentLevel: 'beginner',
      studyTime: '1hour',
    }))
    setHasUnsavedChanges(false)
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader title="Settings" subtitle="Customize your SkillPath experience" />

        <Container className="py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <BrutalCard color="white" className="sticky top-24">
                <nav className="space-y-2">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 brutal-radius font-medium transition-all text-left',
                        activeSection === section.id
                          ? 'bg-yellow font-bold'
                          : 'hover:bg-gray-100'
                      )}
                    >
      <section.icon className="w-5 h-5" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </BrutalCard>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {activeSection === 'profile' && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <BrutalCard color="white">
                    <h2 className="font-display font-bold text-xl mb-6">Profile Settings</h2>

                    <div className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-yellow brutal-border brutal-radius flex items-center justify-center">
                          <span className="text-3xl font-bold">JD</span>
                        </div>
                        <div>
                          <BrutalButton variant="outline" color="black" size="sm">
                            Change Avatar
                          </BrutalButton>
                          <p className="text-sm text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                        </div>
                      </div>

                      {/* Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 font-medium">Full Name</label>
                          <input
                            type="text"
                            value={profileForm.fullName}
                            onChange={(e) => {
                              setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => {
                              setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">GitHub Username</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={profileForm.githubUsername}
                                onChange={(e) => {
                                  setProfileForm((prev) => ({ ...prev, githubUsername: e.target.value }))
                                  setHasUnsavedChanges(true)
                                }}
                                className="w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                              />
                            </div>
                            <a
                              href={`https://github.com/${profileForm.githubUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <BrutalButton variant="ghost" color="black">
                                <ExternalLink className="w-4 h-4" />
                              </BrutalButton>
                            </a>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Target Role</label>
                          <select
                            value={profileForm.targetRole}
                            onChange={(e) => {
                              setProfileForm((prev) => ({ ...prev, targetRole: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                          >
                            <option value="frontend-developer">Frontend Developer</option>
                            <option value="backend-developer">Backend Developer</option>
                            <option value="fullstack-developer">Fullstack Developer</option>
                            <option value="ui-engineer">UI Engineer</option>
                            <option value="mobile-developer">Mobile Developer</option>
                            <option value="data-analyst">Data Analyst</option>
                          </select>
                        </div>

                        <div className="pt-4">
                          <label className="block mb-2 font-medium">Current Level</label>
                          <select
                            value={profileForm.currentLevel}
                            onChange={(e) => {
                              setProfileForm((prev) => ({ ...prev, currentLevel: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="basic">Basic</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="internship-ready">Internship Ready</option>
                          </select>
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Study Time</label>
                          <select
                            value={profileForm.studyTime}
                            onChange={(e) => {
                              setProfileForm((prev) => ({ ...prev, studyTime: e.target.value }))
                              setHasUnsavedChanges(true)
                            }}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                          >
                            <option value="30min">30 minutes per day</option>
                            <option value="1hour">1 hour per day</option>
                            <option value="2hours">2 hours per day</option>
                            <option value="4hours">4 hours per day</option>
                          </select>
                        </div>
                      </div>

                      {/* Save Button */}
                      {hasUnsavedChanges && (
                        <motion.div
                          initial={false}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <BrutalButton color="green" onClick={() => setHasUnsavedChanges(false)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </BrutalButton>
                        </motion.div>
                      )}

                      <div className="border-t-2 border-gray-200 pt-6">
                        <h3 className="font-display font-bold text-lg mb-2">Onboarding</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Reset your career profile flow only when you want to start onboarding again.
                        </p>
                        <BrutalButton variant="outline" color="red" onClick={handleResetOnboarding}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Onboarding
                        </BrutalButton>
                      </div>
                    </div>
                  </BrutalCard>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <BrutalCard color="white">
                    <h2 className="font-display font-bold text-xl mb-6">Notification Preferences</h2>

                    <div className="space-y-4">
                      {[
                        { label: 'Weekly progress reminders', description: 'Get reminded about your weekly sprint goals', enabled: true },
                        { label: 'Job matches', description: 'Receive notifications when new jobs match your profile', enabled: true },
                        { label: 'Roadmap updates', description: 'Updates about changes to your learning roadmap', enabled: false },
                        { label: 'Marketing emails', description: 'Tips, tricks, and updates from SkillPath', enabled: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 brutal-border brutal-radius">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <button
                            onClick={() => {}}
                            className={cn(
                              'w-12 h-6 brutal-radius relative transition-all',
                              item.enabled ? 'bg-green' : 'bg-gray-300'
                            )}
                          >
                            <div className={cn(
                              'w-5 h-5 bg-white brutal-border absolute top-0.5 transition-all',
                              item.enabled ? 'left-6' : 'left-0.5'
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </BrutalCard>
                </motion.div>
              )}

              {activeSection === 'appearance' && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <BrutalCard color="white">
                    <h2 className="font-display font-bold text-xl mb-6">Appearance Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <p className="font-medium mb-3">Theme</p>
                        <div className="grid grid-cols-3 gap-4">
                          {['Light', 'Dark', 'System'].map((theme) => (
                            <button
                              key={theme}
                              className={cn(
                                'p-4 brutal-border brutal-radius font-medium transition-all',
                                theme === 'Light' ? 'bg-yellow font-bold' : 'bg-gray-50 hover:bg-gray-100'
                              )}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium mb-3">Animations</p>
                        <div className="flex items-center justify-between p-4 bg-gray-50 brutal-border brutal-radius">
                          <div>
                            <p className="font-medium">Reduced motion</p>
                            <p className="text-sm text-gray-500">Minimize animations for accessibility</p>
                          </div>
                          <button
                            onClick={() => {}}
                            className="w-12 h-6 brutal-radius relative bg-gray-300"
                          >
                            <div className="w-5 h-5 bg-white brutal-border absolute left-0.5 top-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </BrutalCard>
                </motion.div>
              )}

              {activeSection === 'security' && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <BrutalCard color="white">
                    <h2 className="font-display font-bold text-xl mb-6">Security Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Change Password</h3>
                        <div className="space-y-3">
                          <input
                            type="password"
                            placeholder="Current password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50"
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50"
                          />
                          <BrutalButton color="blue">Update Password</BrutalButton>
                        </div>
                      </div>

                      <div className="pt-6 border-t-2 border-gray-200">
                        <h3 className="font-medium mb-2">Connected Accounts</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 brutal-border brutal-radius">
                          <div className="flex items-center gap-3">
                            <Github className="w-6 h-6" />
                            <div>
                              <p className="font-medium">GitHub</p>
                              <p className="text-sm text-gray-500">Connected as @{profileForm.githubUsername}</p>
                            </div>
                          </div>
                          <BrutalButton variant="outline" color="black" size="sm">
                            Disconnect
                          </BrutalButton>
                        </div>
                      </div>

                      <div className="pt-6 border-t-2 border-gray-200">
                        <h3 className="font-medium mb-2">Session</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 brutal-border brutal-radius">
                          <div>
                            <p className="font-medium">Sign out of your account</p>
                            <p className="text-sm text-gray-500">You will be redirected to the login page</p>
                          </div>
                          <LogoutButton color="red" size="sm" />
                        </div>
                      </div>

                      <div className="pt-6 border-t-2 border-gray-200">
                        <h3 className="font-medium mb-2 text-red">Danger Zone</h3>
                        <div className="flex items-center justify-between p-4 bg-red/10 border-2 border-red brutal-radius">
                          <div>
                            <p className="font-medium text-red">Delete Account</p>
                            <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                          </div>
                          <BrutalButton color="red" size="sm">
                            Delete
                          </BrutalButton>
                        </div>
                      </div>
                    </div>
                  </BrutalCard>
                </motion.div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}
