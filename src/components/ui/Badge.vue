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
        secondary: 'border-zinc-200 bg-zinc-100 text-zinc-600 font-medium',
        destructive: 'border-red-200 bg-red-50 text-red-700 font-medium',
        outline: 'text-foreground border-zinc-300',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium',
        warning: 'border-amber-200 bg-amber-50 text-amber-700 font-medium',
        info: 'border-blue-200 bg-blue-50 text-blue-700 font-medium',
        purple: 'border-purple-200 bg-purple-50 text-purple-700 font-medium',
        risk: 'border-orange-200 bg-orange-50 text-orange-700 font-semibold'
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
