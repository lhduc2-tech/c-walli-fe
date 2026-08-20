<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const classes = computed(() => cn('h-12 px-4 text-left align-middle font-semibold text-muted-foreground text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0', props.class))
</script>

<template>
  <th :class="classes">
    <slot />
  </th>
</template>
