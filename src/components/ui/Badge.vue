<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive/15 text-destructive border-destructive/20 hover:bg-destructive/25',
        outline: 'text-foreground',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium',
        info: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium',
        purple: 'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type BadgeVariants = VariantProps<typeof badgeVariants>

interface Props {
  variant?: BadgeVariants['variant']
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const classes = computed(() => {
  return cn(badgeVariants({ variant: props.variant }), props.class)
})
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
