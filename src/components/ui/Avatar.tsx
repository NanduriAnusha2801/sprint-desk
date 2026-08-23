import { useState } from 'react'
import { cn } from '@/lib/cn'

interface AvatarProps {
  src?: string
  name: string
  size?: 'xs' | 'sm' | 'md'
}

const SIZE_CLASSES = {
  xs: 'size-5 text-[10px]',
  sm: 'size-6 text-xs',
  md: 'size-8 text-sm',
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'sm' }: AvatarProps) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent',
          SIZE_CLASSES[size],
        )}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className={cn('shrink-0 rounded-full object-cover', SIZE_CLASSES[size])}
    />
  )
}
