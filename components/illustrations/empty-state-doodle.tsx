import { CatMascot } from './cat-mascot'
import { cn } from '@/lib/utils'

interface EmptyStateDoodleProps {
  className?: string
  label: string
}

export function EmptyStateDoodle({ className, label }: EmptyStateDoodleProps) {
  return (
    <div className={cn('relative flex flex-col items-center gap-3', className)}>
      <div className="relative h-28 w-28">
        <CatMascot className="h-full w-full" mood="focus" />
      </div>
      <div className="rounded-md border-2 border-black bg-white px-3 py-1 text-xs font-bold">
        {label}
      </div>
    </div>
  )
}
