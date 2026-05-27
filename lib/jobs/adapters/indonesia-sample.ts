// Indonesia curated sample data
// This is explicitly labeled as sample data since there's no legal Indonesian API source

import { JobSourceAdapter } from '../types'

export const INDONESIA_SAMPLE_JOBS = [
  {
    id: 'indo-sample-1',
    title: 'Frontend Developer Intern',
    company: 'PT Teknologi Indonesia',
    location: 'Jakarta',
    type: 'full-time',
    tags: ['React', 'TypeScript', 'CSS'],
    url: '#',
    description: 'Bergabunglah dengan tim kami untuk belajar dan berkembang sebagai Frontend Developer. Anda akan bekerja dengan React dan TypeScript dalam tim yang suportif.',
    requiredSkills: ['JavaScript', 'React', 'CSS', 'HTML', 'Git'],
    source: 'sample',
    publishedAt: '2024-01-15',
  },
  {
    id: 'indo-sample-2',
    title: 'Backend Developer Intern',
    company: 'Startup Jakarta',
    location: 'Jakarta',
    type: 'internship',
    tags: ['Node.js', 'PostgreSQL', 'Express'],
    url: '#',
    description: 'Posisi magang untuk mahasiswa yang ingin belajar backend development dengan Node.js dan PostgreSQL. Disediakan mentors dan pelatihan.',
    requiredSkills: ['JavaScript', 'Node.js', 'Express', 'Git'],
    source: 'sample',
    publishedAt: '2024-01-14',
  },
  {
    id: 'indo-sample-3',
    title: 'Mobile Developer Trainee',
    company: 'Digital Solutions Indonesia',
    location: 'Bandung',
    type: 'contract',
    tags: ['React Native', 'JavaScript', 'Android'],
    url: '#',
    description: 'Program pelatihan 6 bulan untuk developer mobile menggunakan React Native. Tidak ada pengalaman diperlukan, passionate dalam coding diperlukan.',
    requiredSkills: ['JavaScript', 'React', 'Git', 'REST API'],
    source: 'sample',
    publishedAt: '2024-01-13',
  },
  {
    id: 'indo-sample-4',
    title: 'UI/UX Design Intern',
    company: 'Creative Digital Agency',
    location: 'Surabaya',
    type: 'internship',
    tags: ['Figma', 'UI/UX', 'CSS'],
    url: '#',
    description: 'Magang 3 bulan untuk mahasiswa desain. Kamu akan belajar UI/UX design menggunakan Figma dan bekerja dengan tim developer.',
    requiredSkills: ['Figma', 'UI/UX', 'CSS', 'HTML'],
    source: 'sample',
    publishedAt: '2024-01-12',
  },
  {
    id: 'indo-sample-5',
    title: 'Fullstack Developer - Fresh Graduate',
    company: 'Tech Company Indonesia',
    location: 'Jakarta',
    type: 'full-time',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    url: '#',
    description: 'Posisi untuk fresh graduate yang ingin berkembang sebagai fullstack developer. Pelatihan dan mentoring disediakan.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git'],
    source: 'sample',
    publishedAt: '2024-01-11',
  },
]

export const indonesiaSampleAdapter: JobSourceAdapter = {
  name: 'Indonesia Sample Data',
  slug: 'indonesia-sample',
  type: 'api',
  region: 'indonesia',
  baseUrl: '',
  attributionLabel: 'Sample Data',
  attributionUrl: '#',

  isConfigured(): boolean {
    return true // Always available as fallback
  },

  async fetch(): Promise<Partial<import('../types').JobPost>[]> {
    return INDONESIA_SAMPLE_JOBS.map(job => this.normalize(job)).filter(Boolean) as Partial<import('../types').JobPost>[]
  },

  normalize(raw: unknown): Partial<import('../types').JobPost> | null {
    if (!raw || typeof raw !== 'object') return null

    const job = raw as typeof INDONESIA_SAMPLE_JOBS[0]

    return {
      id: job.id,
      sourceSlug: 'indonesia-sample',
      externalId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      country: 'Indonesia',
      regionType: 'indonesia',
      workMode: 'onsite',
      employmentType: job.type === 'internship' ? 'internship' : job.type === 'contract' ? 'contract' : 'full-time',
      experienceLevel: 'internship',
      description: job.description,
      applyUrl: job.url,
      sourceUrl: job.url,
      tags: job.tags,
      requiredSkills: job.requiredSkills,
      publishedAt: job.publishedAt,
      fetchedAt: new Date().toISOString(),
      validityScore: 70,
      riskLevel: 'low',
      moderationStatus: 'approved', // Sample data is pre-approved
      moderationReasons: ['Sample data - explicitly labeled'],
    }
  },
}