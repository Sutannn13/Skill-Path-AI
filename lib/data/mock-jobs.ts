import { Job } from '@/types'

export const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Frontend Developer Intern',
    company: 'TechStart Studio',
    location: 'Remote',
    type: 'full-time',
    tags: ['React', 'TypeScript', 'CSS', 'Remote'],
    url: 'https://remotive.com/jobs/example/1',
    description: 'We are looking for a frontend developer intern to join our growing team. You will work on building responsive web applications using React and modern CSS.',
    requiredSkills: ['JavaScript', 'React', 'CSS', 'HTML', 'Git'],
    source: 'mock',
    publishedAt: '2024-01-15',
  },
  {
    id: 'job-2',
    title: 'Junior React Developer',
    company: 'WebCraft Agency',
    location: 'Remote',
    type: 'full-time',
    tags: ['React', 'Next.js', 'Tailwind', 'Remote'],
    url: 'https://remotive.com/jobs/example/2',
    description: 'Join our team as a junior React developer. You will collaborate with senior developers to build modern web applications for our clients.',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'REST API', 'Git'],
    source: 'mock',
    publishedAt: '2024-01-14',
  },
  {
    id: 'job-3',
    title: 'Fullstack Developer Trainee',
    company: 'DevMountain',
    location: 'Remote',
    type: 'contract',
    tags: ['Node.js', 'React', 'PostgreSQL', 'Remote'],
    url: 'https://remotive.com/jobs/example/3',
    description: 'Start your fullstack developer journey with us. You will learn to build complete web applications with Node.js, React, and PostgreSQL.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Git', 'REST API'],
    source: 'mock',
    publishedAt: '2024-01-13',
  },
  {
    id: 'job-4',
    title: 'Frontend Engineer',
    company: 'Pixel Perfect Labs',
    location: 'Remote',
    type: 'full-time',
    tags: ['Vue.js', 'TypeScript', 'Testing', 'Remote'],
    url: 'https://remotive.com/jobs/example/4',
    description: 'We need a frontend engineer who cares about details. You will build beautiful, accessible, and performant user interfaces.',
    requiredSkills: ['JavaScript', 'TypeScript', 'CSS', 'Responsive Design', 'Testing'],
    source: 'mock',
    publishedAt: '2024-01-12',
  },
  {
    id: 'job-5',
    title: 'Junior UI Developer',
    company: 'CreativeBytes',
    location: 'Remote',
    type: 'part-time',
    tags: ['UI', 'CSS', 'Figma', 'Remote'],
    url: 'https://remotive.com/jobs/example/5',
    description: 'Looking for a UI developer who loves turning designs into code. Experience with Figma is a plus.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'UI/UX Basic', 'Responsive Design'],
    source: 'mock',
    publishedAt: '2024-01-11',
  },
  {
    id: 'job-6',
    title: 'React Native Developer',
    company: 'MobileFirst Inc',
    location: 'Remote',
    type: 'full-time',
    tags: ['React Native', 'JavaScript', 'iOS', 'Android', 'Remote'],
    url: 'https://remotive.com/jobs/example/6',
    description: 'Build cross-platform mobile applications using React Native. Experience with mobile development is not required.',
    requiredSkills: ['JavaScript', 'React', 'REST API', 'Git'],
    source: 'mock',
    publishedAt: '2024-01-10',
  },
  {
    id: 'job-7',
    title: 'Backend Developer Intern',
    company: 'ServerSide Solutions',
    location: 'Remote',
    type: 'full-time',
    tags: ['Node.js', 'Express', 'MongoDB', 'Remote'],
    url: 'https://remotive.com/jobs/example/7',
    description: 'Join our backend team and learn how to build scalable APIs. You will work with Node.js, Express, and MongoDB.',
    requiredSkills: ['JavaScript', 'Node.js', 'Express', 'Git', 'REST API'],
    source: 'mock',
    publishedAt: '2024-01-09',
  },
  {
    id: 'job-8',
    title: 'Web Developer',
    company: 'Digital Horizon',
    location: 'Remote',
    type: 'freelance',
    tags: ['WordPress', 'PHP', 'CSS', 'Remote'],
    url: 'https://remotive.com/jobs/example/8',
    description: 'We need a web developer to maintain and enhance client websites built on WordPress.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Git'],
    source: 'mock',
    publishedAt: '2024-01-08',
  },
  {
    id: 'job-9',
    title: 'Frontend Developer',
    company: 'Innovation Labs',
    location: 'Remote',
    type: 'full-time',
    tags: ['React', 'Redux', 'TypeScript', 'Remote'],
    url: 'https://remotive.com/jobs/example/9',
    description: 'Build complex React applications with Redux for state management. We value clean code and good practices.',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'State Management', 'Testing', 'Git'],
    source: 'mock',
    publishedAt: '2024-01-07',
  },
  {
    id: 'job-10',
    title: 'Junior Frontend Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'full-time',
    tags: ['HTML', 'CSS', 'JavaScript', 'Remote'],
    url: 'https://remotive.com/jobs/example/10',
    description: 'Start your frontend career with us! We are looking for eager developers who want to learn and grow.',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Git'],
    source: 'mock',
    publishedAt: '2024-01-06',
  },
]

export function getMockJobs(): Job[] {
  return MOCK_JOBS
}

export function getMockJobById(id: string): Job | undefined {
  return MOCK_JOBS.find((job) => job.id === id)
}

export function filterMockJobs(
  query?: string,
  tags?: string[]
): Job[] {
  let jobs = [...MOCK_JOBS]

  if (query) {
    const lowerQuery = query.toLowerCase()
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowerQuery) ||
        job.company.toLowerCase().includes(lowerQuery) ||
        job.description.toLowerCase().includes(lowerQuery)
    )
  }

  if (tags && tags.length > 0) {
    jobs = jobs.filter((job) =>
      tags.some((tag) => job.tags.includes(tag))
    )
  }

  return jobs
}