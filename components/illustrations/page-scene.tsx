import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Code2,
  Flag,
  Github,
  HelpCircle,
  Home,
  Laptop,
  Map,
  Rocket,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { BrutalCard } from '@/components/brutal'
import { CartoonSticker, type CartoonStickerColor } from '@/components/ui/cartoon-sticker'
import { cn } from '@/lib/utils'
import { CartoonMascot, type CartoonMascotAccessory, type CartoonMascotMood } from './cartoon-mascot'
import type { CartoonBackgroundVariant } from './floating-doodles'

interface PageSceneProps {
  variant: CartoonBackgroundVariant
  className?: string
  compact?: boolean
}

interface SceneConfig {
  title: string
  description: string
  color: 'white' | 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  mood: CartoonMascotMood
  accessory: CartoonMascotAccessory
  stickers: Array<{
    icon: LucideIcon
    label?: string
    color: CartoonStickerColor
  }>
}

const scenes: Record<CartoonBackgroundVariant, SceneConfig> = {
  default: {
    title: 'Developer workspace ready',
    description: 'Your learning map, sprint, jobs, and portfolio signals stay connected.',
    color: 'white',
    mood: 'happy',
    accessory: 'laptop',
    stickers: [
      { icon: Code2, label: 'code', color: 'blue' },
      { icon: CheckCircle2, label: 'done', color: 'green' },
    ],
  },
  dashboard: {
    title: 'Career basecamp online',
    description: 'Role, roadmap, sprint, jobs, and GitHub signals stay visible in one place.',
    color: 'yellow',
    mood: 'happy',
    accessory: 'laptop',
    stickers: [
      { icon: Home, label: 'base', color: 'white' },
      { icon: Trophy, label: 'progress', color: 'green' },
    ],
  },
  roadmap: {
    title: 'Learning map mode',
    description: 'Modules stay clean while quizzes and project work open on focused pages.',
    color: 'pink',
    mood: 'focused',
    accessory: 'map',
    stickers: [
      { icon: Map, label: 'map', color: 'yellow' },
      { icon: Flag, label: 'level', color: 'green' },
    ],
  },
  sprint: {
    title: 'Weekly quest board',
    description: 'Today, blockers, and completed work are easier to scan without squeezing tasks.',
    color: 'green',
    mood: 'focused',
    accessory: 'clipboard',
    stickers: [
      { icon: CalendarDays, label: 'week', color: 'white' },
      { icon: CheckCircle2, label: 'ship', color: 'yellow' },
    ],
  },
  jobs: {
    title: 'Job radar tuned',
    description: 'Early-career Indonesia roles, skill matches, and source links stay front and center.',
    color: 'blue',
    mood: 'thinking',
    accessory: 'briefcase',
    stickers: [
      { icon: Briefcase, label: 'roles', color: 'yellow' },
      { icon: SlidersHorizontal, label: 'filters', color: 'white' },
    ],
  },
  quiz: {
    title: 'Focus quiz arena',
    description: 'Answer, submit, and review feedback without the roadmap page getting crowded.',
    color: 'purple',
    mood: 'focused',
    accessory: 'pencil',
    stickers: [
      { icon: HelpCircle, label: 'quiz', color: 'yellow' },
      { icon: Sparkles, label: 'pass', color: 'green' },
    ],
  },
  project: {
    title: 'Developer workshop',
    description: 'Submit repo links, demos, and notes, then use review feedback for the next pass.',
    color: 'orange',
    mood: 'focused',
    accessory: 'laptop',
    stickers: [
      { icon: Laptop, label: 'repo', color: 'blue' },
      { icon: Rocket, label: 'deploy', color: 'green' },
    ],
  },
  settings: {
    title: 'Account toolkit',
    description: 'Keep profile, preferences, and security details tidy without leaving the app.',
    color: 'white',
    mood: 'thinking',
    accessory: 'gear',
    stickers: [
      { icon: Settings, label: 'gear', color: 'purple' },
      { icon: CheckCircle2, label: 'saved', color: 'green' },
    ],
  },
  onboarding: {
    title: 'Career setup trail',
    description: 'Pick your role, level, and goals so SkillPath can shape the right roadmap.',
    color: 'yellow',
    mood: 'happy',
    accessory: 'map',
    stickers: [
      { icon: Flag, label: 'start', color: 'pink' },
      { icon: BookOpen, label: 'skills', color: 'green' },
    ],
  },
  auth: {
    title: 'Welcome back to the path',
    description: 'Sign in, continue the roadmap, and keep your progress moving.',
    color: 'yellow',
    mood: 'happy',
    accessory: 'none',
    stickers: [
      { icon: Sparkles, label: 'ready', color: 'pink' },
      { icon: Code2, label: 'dev', color: 'blue' },
    ],
  },
  skills: {
    title: 'Skill shelf sorted',
    description: 'Your strengths and gaps stay visible against the role you selected.',
    color: 'green',
    mood: 'focused',
    accessory: 'trophy',
    stickers: [
      { icon: BookOpen, label: 'learn', color: 'white' },
      { icon: Code2, label: 'stack', color: 'yellow' },
    ],
  },
  github: {
    title: 'Portfolio signal check',
    description: 'Repository activity, project quality, and next fixes stay easy to act on.',
    color: 'blue',
    mood: 'thinking',
    accessory: 'laptop',
    stickers: [
      { icon: Github, label: 'repo', color: 'white' },
      { icon: Rocket, label: 'ship', color: 'orange' },
    ],
  },
}

export function PageScene({ variant, className, compact = false }: PageSceneProps) {
  const scene = scenes[variant] ?? scenes.default

  return (
    <BrutalCard
      color={scene.color}
      shadow="sm"
      className={cn(
        'relative overflow-hidden',
        compact ? 'p-4' : 'p-5 sm:p-6',
        className
      )}
    >
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold sm:text-xl">{scene.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-black/70">{scene.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {scene.stickers.map((sticker) => (
              <CartoonSticker
                key={`${scene.title}-${sticker.label}`}
                icon={sticker.icon}
                label={sticker.label}
                color={sticker.color}
                size="sm"
              />
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 sm:block">
          <CartoonMascot
            mood={scene.mood}
            accessory={scene.accessory}
            size={compact ? 'sm' : 'md'}
          />
        </div>
      </div>

      <div className="absolute -right-6 -top-6 h-20 w-20 rotate-12 rounded-brutal border-3 border-black bg-white/35" />
      <div className="absolute -bottom-8 left-10 h-16 w-28 -rotate-6 rounded-brutal border-3 border-black bg-white/25" />
    </BrutalCard>
  )
}
