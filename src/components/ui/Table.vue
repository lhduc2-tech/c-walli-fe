<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const classes = computed(() => cn('w-full caption-bottom text-sm', props.class))
</script>

<template>
  <div class="relative w-full overflow-auto rounded-xl border border-border/80 bg-card shadow-sm">
    <table :class="classes">
      <slot />
    </table>
  </div>
</template>
