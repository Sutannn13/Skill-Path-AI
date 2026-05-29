'use client'

import Link from 'next/link'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalButton, BrutalCard } from '@/components/brutal'
import { ArrowLeft, AlertTriangle, Briefcase } from 'lucide-react'

export default function JobNotFound() {
  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />
      <DashboardHeader
        icon={Briefcase}
        iconColor="blue"
        title="Job Not Found"
        subtitle="This posting is not available"
      />

      <Container className="py-6">
        <BrutalCard color="white" className="max-w-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow" />
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-3xl mb-3">Job Not Found</h1>
              <p className="text-gray-600 mb-8">
                The job posting you are looking for does not exist, may have expired, or has been removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/jobs">
                  <BrutalButton color="yellow">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse All Jobs
                  </BrutalButton>
                </Link>
                <Link href="/dashboard">
                  <BrutalButton variant="outline" color="black">
                    Go to Dashboard
                  </BrutalButton>
                </Link>
              </div>
            </div>
          </div>
        </BrutalCard>
      </Container>
    </AppShell>
  )
}